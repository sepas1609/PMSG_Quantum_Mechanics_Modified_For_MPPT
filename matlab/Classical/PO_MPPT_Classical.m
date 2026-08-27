%% PO_MPPT_Classical.m
% =========================================================================
% Perturb & Observe (P&O) MPPT Controller — Classical Sensor Version
%
% Description:
%   Implements the standard Perturb & Observe Maximum Power Point Tracking
%   algorithm. Receives NOISY, DELAYED voltage and current readings from
%   the classical sensor model, which causes oscillation around the MPP,
%   especially during sudden wind speed changes (gusts).
%
% Algorithm:
%   1. Measure P = V × I (using delayed/noisy classical sensor values)
%   2. Compare current power with previous power (ΔP)
%   3. Compare current voltage with previous voltage (ΔV)
%   4. Perturb duty cycle D in the direction that increases power
%   5. Saturate D between D_min and D_max
%
% Usage (called from Simulink MATLAB Function block or from run_classical.m)
% =========================================================================

function duty_cycle = PO_MPPT_Classical(V_sensed, I_sensed)
%PO_MPPT_CLASSICAL Classical P&O MPPT using noisy/delayed sensor inputs
%
%   Input:
%     V_sensed - Voltage measured by classical sensor [V] (has noise + delay)
%     I_sensed - Current measured by classical sensor [A] (has noise + delay)
%
%   Output:
%     duty_cycle - PWM duty cycle for the DC-DC boost/buck converter [0-1]

    % Persistent variables retain state between Simulink time steps
    persistent P_old V_old D_old;
    if isempty(P_old)
        P_old = 0;
        V_old = 0;
        D_old = 0.5;    % Start at 50% duty cycle
    end

    % Controller constants (from PMSG_Parameters.m)
    delta_D = 0.005;    % Perturbation step size (0.5%)
    D_min   = 0.1;      % Min duty cycle (10%)
    D_max   = 0.9;      % Max duty cycle (90%)

    % --- Step 1: Compute current power from NOISY, DELAYED sensor readings ---
    % This is the core weakness of the classical approach:
    % The power estimate P_current is corrupted by sensor noise and delayed by
    % the communication lag, causing the MPPT to react to old, noisy data.
    P_current = V_sensed * I_sensed;

    % --- Step 2: Compute differences ---
    delta_P = P_current - P_old;
    delta_V = V_sensed  - V_old;

    % --- Step 3: P&O decision logic ---
    D = D_old;

    if delta_P > 0
        % Power is increasing — continue in the same direction
        if delta_V > 0
            D = D_old - delta_D;    % Voltage increased → decrease duty
        else
            D = D_old + delta_D;    % Voltage decreased → increase duty
        end
    elseif delta_P < 0
        % Power is decreasing — reverse direction
        if delta_V > 0
            D = D_old + delta_D;    % Voltage increased → increase duty
        else
            D = D_old - delta_D;    % Voltage decreased → decrease duty
        end
    end
    % If delta_P == 0: no change needed (at MPP)

    % --- Step 4: Saturate duty cycle ---
    D = max(D_min, min(D_max, D));

    % --- Step 5: Update persistent memory ---
    P_old = P_current;
    V_old = V_sensed;
    D_old = D;

    duty_cycle = D;
end


%% ── Classical MPPT Standalone Simulation ────────────────────────────────
%  Tests the P&O controller response with a simulated wind gust scenario
%  using classical (noisy, delayed) sensor inputs.
%
%  Run this script directly to generate standalone results without Simscape.

if strcmp(mfilename, 'PO_MPPT_Classical')
    fprintf('\n=========================================================\n');
    fprintf('  P&O MPPT Classical — Standalone Simulation (No Simscape)\n');
    fprintf('=========================================================\n');

    % Load shared parameters
    run(fullfile(fileparts(mfilename('fullpath')), '..', 'PMSG_Parameters.m'));

    % Time vector
    t = (0:Ts:T_end)';
    N = length(t);

    % --- Interpolate wind speed profile ---
    v_wind = interp1(wind_t, wind_v, t, 'previous', wind_v(end));

    % --- Simulate simplified PMSG + MPPT (analytical model) ---
    % Power available from wind: P_wind = 0.5 * rho * pi * R^2 * Cp * v^3
    P_available = 0.5 * rho * pi * R_blade^2 * Cp_max .* v_wind.^3;
    P_available = min(P_available, P_rated);    % Clamp to rated power

    % Preallocate results
    D_out       = zeros(N, 1);
    P_extracted = zeros(N, 1);
    V_sim       = zeros(N, 1);
    I_sim       = zeros(N, 1);

    D_current = D_init;

    % Persistent sensor buffer (simulating classical delay)
    spd_buf = zeros(1, sensor_delay_steps);
    flx_buf = zeros(1, sensor_delay_steps);

    fprintf('  Running simulation (%.1f s, Ts=%.1e s)...\n', T_end, Ts);
    tic;

    for k = 1:N
        % True PMSG output (simplified: V and I derived from available power)
        omega_true = lambda_opt * v_wind(k) / R_blade;   % Optimal rotor speed
        V_true     = lambda_f * omega_true * p;           % Back-EMF estimate
        I_true     = P_available(k) / max(V_true, 1);    % Current

        % === CLASSICAL SENSOR: Add EMI noise + communication delay ===
        noise       = sensor_noise_classical * randn();
        spd_buf     = [omega_true, spd_buf(1:end-1)];
        flx_buf     = [lambda_f,   flx_buf(1:end-1)];
        V_sensed    = spd_buf(end) * lambda_f * p * (1 + noise);
        I_sensed    = I_true * (1 + noise);

        % === P&O MPPT on noisy/delayed data ===
        D_current   = PO_MPPT_Classical(V_sensed, I_sensed);

        % Extracted power (converter efficiency modelled as f(duty cycle))
        eta_conv    = 0.95 - 0.1*(D_current - 0.5)^2;   % Peak efficiency at D=0.5
        P_extracted(k) = P_available(k) * D_current * eta_conv;
        D_out(k)    = D_current;
        V_sim(k)    = V_sensed;
        I_sim(k)    = I_sensed;
    end

    elapsed = toc;
    fprintf('  Simulation complete in %.2f s\n', elapsed);

    % --- Save results ---
    results_classical.t           = t;
    results_classical.P_available = P_available;
    results_classical.P_extracted = P_extracted;
    results_classical.duty_cycle  = D_out;
    results_classical.v_wind      = v_wind;
    results_classical.sensor_type = 'Classical (Hall-effect + Encoder)';
    results_classical.efficiency  = mean(P_extracted ./ max(P_available, 1)) * 100;

    save(fullfile(fileparts(mfilename('fullpath')), 'classical_results.mat'), ...
         'results_classical');
    fprintf('  Results saved to Classical/classical_results.mat\n');
    fprintf('  Mean MPPT Efficiency: %.2f%%\n', results_classical.efficiency);

    % --- Quick plot ---
    run(fullfile(fileparts(mfilename('fullpath')), 'Classical_Results_Analysis.m'));
end
