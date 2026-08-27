% generate_training_data.m
disp('Generating training data...');

rho = 1.225;
R = 2.4;
beta = 0;
Rated_Power = 3000;
V_rated = 230;

V_s = linspace(4, 20, 820);
lambda_test = linspace(0.1, 15, 1000);
Cp_max = 0;
lambda_opt = 0;

for i = 1:length(lambda_test)
    lam = lambda_test(i);
    inv_lam_i = 1/lam - 0.035;
    if inv_lam_i > 0
        Cp = 0.5176 * (116 * inv_lam_i - 5) * exp(-21 * inv_lam_i) + 0.0068 * lam;
        if Cp > Cp_max
            Cp_max = Cp;
            lambda_opt = lam;
        end
    end
end

omega_r_rated = lambda_opt * 12 / R;
K_v = V_rated / omega_r_rated;
R_load = 380^2 / Rated_Power; % 48.13 ohms

Vdc_train = zeros(820, 1);
Idc_train = zeros(820, 1);
D_train_boost = zeros(820, 1);
D_train_sepic = zeros(820, 1);
D_train_qboost = zeros(820, 1);

for i = 1:820
    v = V_s(i);
    omega_r_opt = lambda_opt * v / R;
    P_m = 0.5 * pi * rho * R^2 * v^3 * Cp_max;
    
    V_dc = K_v * omega_r_opt;
    I_dc = P_m / V_dc;
    
    Vdc_train(i) = V_dc;
    Idc_train(i) = I_dc;
    
    % Boost: V_out = V_in / (1 - D) -> D = 1 - V_in / V_out
    % P_out = P_m -> V_out = sqrt(P_m * R_load)
    V_out_req = sqrt(P_m * R_load);
    if V_out_req > V_dc
        D_train_boost(i) = 1 - V_dc / V_out_req;
    else
        D_train_boost(i) = 0;
    end
    
    % SEPIC: V_out = V_in * D / (1 - D) -> D = V_out / (V_in + V_out)
    D_train_sepic(i) = V_out_req / (V_dc + V_out_req);
    
    % Quadratic Boost: V_out = V_in / (1 - D)^2 -> D = 1 - sqrt(V_in / V_out)
    if V_out_req > V_dc
        D_train_qboost(i) = 1 - sqrt(V_dc / V_out_req);
    else
        D_train_qboost(i) = 0;
    end
end

save('training_data.mat', 'Vdc_train', 'Idc_train', 'D_train_boost', 'D_train_sepic', 'D_train_qboost', 'lambda_opt', 'K_v');
disp('Training data saved to training_data.mat');
