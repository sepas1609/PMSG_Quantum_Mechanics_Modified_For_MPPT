% simulate_wecs.m
disp('Simulating WECS...');

load('training_data.mat', 'lambda_opt', 'K_v');
load('trained_networks.mat');

dt = 1e-5;
T_end = 10;
t = 0:dt:T_end;
N = length(t);

rho = 1.225;
R = 2.4;
beta = 0;
Rated_Power = 3000;
R_load = 380^2 / Rated_Power;
J_eq = 0.5;
D_friction = 0.01;

L_boost = 146.11e-6; C_boost = 27.875e-6;
L1_sepic = 63.52e-3; L2_sepic = 63.52e-3; Cdc_sepic = 33.752e-3; Co_sepic = 16.86e-3;
L1_qb = 77.3e-6; L2_qb = 99.73e-6; Cdc_qb = 0.31e-6; Co_qb = 0.19e-6;

f_sw = 24000; T_sw = 1/f_sw;

rng(0);
V_s = 12 + 2*sin(2*pi*0.5*t) + 1.5*sin(2*pi*1.3*t) + 1*randn(1, N)*0.5;
V_s = max(8, min(18, smoothdata(V_s, 'gaussian', 1000)));

Vout_boost = zeros(3, N); Pout_boost = zeros(3, N);
Vout_sepic = zeros(3, N); Pout_sepic = zeros(3, N);
Vout_qboost = zeros(3, N); Pout_qboost = zeros(3, N);

converters = {'Boost', 'SEPIC', 'QBoost'};
mppts = {'P&O', 'BPN', 'RBFN'};

T_mppt = 0.01; % 100 Hz MPPT update rate
steps_mppt = round(T_mppt / dt);

for c_idx = 1:3
    for m_idx = 1:3
        disp(['Simulating ', converters{c_idx}, ' with ', mppts{m_idx}, '...']);
        
        omega_r = 15;
        if c_idx == 1; i_L = 0; v_C = 380;
        elseif c_idx == 2; i_L1 = 0; i_L2 = 0; v_Cdc = 100; v_Co = 380;
        else; i_L1 = 0; i_L2 = 0; v_Cdc = 100; v_Co = 380; end
        
        D = 0.5; P_prev = 0; Vdc_prev = 0;
        V_out_hist = zeros(1, N); P_out_hist = zeros(1, N);
        t_sw = 0;
        
        V_dc_sum = 0; I_dc_sum = 0;
        
        for k = 1:N
            v_w = V_s(k);
            
            lambda = R * omega_r / v_w;
            if lambda == 0; lambda = 0.01; end
            inv_lam_i = 1/lambda - 0.035;
            if inv_lam_i > 0
                Cp = 0.5176 * (116 * inv_lam_i - 5) * exp(-21 * inv_lam_i) + 0.0068 * lambda;
            else; Cp = 0; end
            if Cp < 0; Cp = 0; end
            
            T_m = 0.5 * pi * rho * R^2 * v_w^3 * Cp / omega_r;
            V_dc = K_v * omega_r;
            
            if c_idx == 1; I_dc = max(i_L, 0);
            else; I_dc = max(i_L1, 0); end
            
            V_dc_sum = V_dc_sum + V_dc;
            I_dc_sum = I_dc_sum + I_dc;
            
            if mod(k, steps_mppt) == 0
                V_dc_avg = V_dc_sum / steps_mppt;
                I_dc_avg = I_dc_sum / steps_mppt;
                V_dc_sum = 0; I_dc_sum = 0;
                
                if m_idx == 1 % P&O
                    P_curr = V_dc_avg * I_dc_avg;
                    dP = P_curr - P_prev;
                    dV = V_dc_avg - Vdc_prev;
                    if abs(dP) > 1 % Threshold
                        if dP > 0
                            if dV > 0; D = D - 0.002; else; D = D + 0.002; end
                        else
                            if dV > 0; D = D + 0.002; else; D = D - 0.002; end
                        end
                    end
                    P_prev = P_curr;
                    Vdc_prev = V_dc_avg;
                elseif m_idx == 2 % BPN
                    X_in = [V_dc_avg; I_dc_avg];
                    if c_idx == 1; D = net_bp_boost(X_in);
                    elseif c_idx == 2; D = net_bp_sepic(X_in);
                    else; D = net_bp_qboost(X_in); end
                elseif m_idx == 3 % RBFN
                    X_in = [V_dc_avg; I_dc_avg];
                    if c_idx == 1; D = net_rbf_boost(X_in);
                    elseif c_idx == 2; D = net_rbf_sepic(X_in);
                    else; D = net_rbf_qboost(X_in); end
                end
                D = max(0.1, min(0.9, D));
            end
            
            t_sw = mod(t_sw + dt, T_sw);
            if t_sw < D * T_sw; S = 1; else; S = 0; end
            
            I_in = 0; V_out = 0;
            if c_idx == 1 % Boost
                if S == 1
                    di_L = V_dc / L_boost; dv_C = -v_C / (R_load * C_boost);
                else
                    di_L = (V_dc - v_C) / L_boost; dv_C = (i_L - v_C/R_load) / C_boost;
                end
                i_L = i_L + di_L * dt; i_L = max(0, i_L);
                v_C = v_C + dv_C * dt; v_C = max(0, v_C);
                I_in = i_L; V_out = v_C;
            elseif c_idx == 2 % SEPIC
                if S == 1
                    di_L1 = V_dc / L1_sepic; di_L2 = v_Cdc / L2_sepic;
                    dv_Cdc = -i_L2 / Cdc_sepic; dv_Co = -v_Co / (R_load * Co_sepic);
                else
                    di_L1 = (V_dc - v_Cdc - v_Co) / L1_sepic; di_L2 = -v_Co / L2_sepic;
                    dv_Cdc = i_L1 / Cdc_sepic; dv_Co = (i_L1 + i_L2 - v_Co/R_load) / Co_sepic;
                end
                i_L1 = i_L1 + di_L1 * dt; i_L1 = max(0, i_L1);
                i_L2 = i_L2 + di_L2 * dt;
                v_Cdc = v_Cdc + dv_Cdc * dt;
                v_Co = v_Co + dv_Co * dt; v_Co = max(0, v_Co);
                I_in = i_L1; V_out = v_Co;
            elseif c_idx == 3 % QBoost
                if S == 1
                    di_L1 = V_dc / L1_qb; di_L2 = v_Cdc / L2_qb;
                    dv_Cdc = -i_L2 / Cdc_qb; dv_Co = -v_Co / (R_load * Co_qb);
                else
                    di_L1 = (V_dc - v_Cdc) / L1_qb; di_L2 = (v_Cdc - v_Co) / L2_qb;
                    dv_Cdc = (i_L1 - i_L2) / Cdc_qb; dv_Co = (i_L2 - v_Co/R_load) / Co_qb;
                end
                i_L1 = i_L1 + di_L1 * dt; i_L1 = max(0, i_L1);
                i_L2 = i_L2 + di_L2 * dt; i_L2 = max(0, i_L2);
                v_Cdc = v_Cdc + dv_Cdc * dt; v_Cdc = max(0, v_Cdc);
                v_Co = v_Co + dv_Co * dt; v_Co = max(0, v_Co);
                I_in = i_L1; V_out = v_Co;
            end
            
            T_e = V_dc * I_in / omega_r;
            d_omega = (T_m - T_e - D_friction * omega_r) / J_eq;
            omega_r = omega_r + d_omega * dt;
            omega_r = max(5, omega_r);
            
            V_out_hist(k) = V_out;
            P_out_hist(k) = V_out^2 / R_load;
        end
        
        if c_idx == 1; Vout_boost(m_idx, :) = V_out_hist; Pout_boost(m_idx, :) = P_out_hist;
        elseif c_idx == 2; Vout_sepic(m_idx, :) = V_out_hist; Pout_sepic(m_idx, :) = P_out_hist;
        else; Vout_qboost(m_idx, :) = V_out_hist; Pout_qboost(m_idx, :) = P_out_hist; end
    end
end

save('simulation_results.mat', 't', 'V_s', 'Vout_boost', 'Pout_boost', 'Vout_sepic', 'Pout_sepic', 'Vout_qboost', 'Pout_qboost');
disp('Simulation complete and saved to simulation_results.mat');
