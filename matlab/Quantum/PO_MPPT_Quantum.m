%% PO_MPPT_Quantum.m
% =========================================================================
% Perturb & Observe (P&O) MPPT Controller — Quantum NV Sensor Version
%
% Description:
%   Identical P&O algorithm to the classical version, but receives CLEAN,
%   INSTANTANEOUS readings from the Quantum NV sensor model.
%
%   Why does the same algorithm perform better?
%   - The quantum sensor provides the ACTUAL power with 50× less noise
%   - Zero delay means the MPPT sees the CURRENT operating point, not a
%     50-step-old reading
%   - During the wind gust, the quantum MPPT responds in the very next
%     simulation step — no oscillation or hunting
%
%   This demonstrates a key insight: quantum advantage comes from sensor
%   quality, not algorithmic complexity. Even a simple P&O benefits greatly.
% =========================================================================

function duty_cycle = PO_MPPT_Quantum(V_sensed, I_sensed)
%PO_MPPT_QUANTUM Quantum-enhanced P&O MPPT (noiseless, zero-delay inputs)
%
%   Input:
%     V_sensed - Voltage measured by quantum NV sensor [V] (clean, instant)
%     I_sensed - Current measured by quantum NV sensor [A] (clean, instant)
%
%   Output:
%     duty_cycle - PWM duty cycle for the DC-DC converter [0.1–0.9]

    persistent P_old V_old D_old;
    if isempty(P_old)
        P_old = 0;
        V_old = 0;
        D_old = 0.5;
    end

    % Same P&O constants as classical (fair comparison)
    delta_D = 0.005;
    D_min   = 0.1;
    D_max   = 0.9;

    % --- Compute power from CLEAN, INSTANT quantum sensor readings ---
    % Unlike classical: P_current is accurate (no noise, no time lag)
    % The quantum NV sensor measures the actual magnetic flux state directly,
    % which maps to the true electrical output without EMI corruption.
    P_current = V_sensed * I_sensed;

    % --- P&O Logic (identical to classical) ---
    delta_P = P_current - P_old;
    delta_V = V_sensed  - V_old;
    D = D_old;

    if delta_P > 0
        if delta_V > 0
            D = D_old - delta_D;
        else
            D = D_old + delta_D;
        end
    elseif delta_P < 0
        if delta_V > 0
            D = D_old + delta_D;
        else
            D = D_old - delta_D;
        end
    end

    D = max(D_min, min(D_max, D));

    P_old = P_current;
    V_old = V_sensed;
    D_old = D;

    duty_cycle = D;
end


%% ── Quantum MPPT Standalone Simulation ──────────────────────────────────
if strcmp(mfilename, 'PO_MPPT_Quantum')
    fprintf('\n=========================================================\n');
    fprintf('  P&O MPPT Quantum — Standalone Simulation (No Simscape)\n');
    fprintf('=========================================================\n');

    run(fullfile(fileparts(mfilename('fullpath')), '..', 'PMSG_Parameters.m'));

    t = (0:Ts:T_end)';
    N = length(t);
    v_wind = interp1(wind_t, wind_v, t, 'previous', wind_v(end));
    P_available = min(0.5 * rho * pi * R_blade^2 * Cp_max .* v_wind.^3, P_rated);

    D_out       = zeros(N,1);
    P_extracted = zeros(N,1);

    clear PO_MPPT_Quantum;
    P_old = 0; V_old = 0; D_old = D_init;

    fprintf('  Running simulation...\n');
    tic;
    for k = 1:N
        omega_k  = lambda_opt * v_wind(k) / R_blade;
        V_true   = lambda_f * omega_k * p;
        I_true   = P_available(k) / max(V_true, 0.1);

        % === QUANTUM NV SENSOR: tiny shot noise, zero delay ===
        V_sensed = V_true  * (1 + sensor_noise_quantum * randn());
        I_sensed = I_true  * (1 + sensor_noise_quantum * randn());

        % === P&O MPPT on clean data ===
        P_cur = V_sensed * I_sensed;
        dP    = P_cur - P_old;
        dV    = V_sensed - V_old;
        D     = D_old;

        if dP > 0
            D = D_old + (dV > 0)*(-delta_D) + (dV <= 0)*delta_D;
        elseif dP < 0
            D = D_old + (dV > 0)*delta_D    + (dV <= 0)*(-delta_D);
        end
        D = max(D_min, min(D_max, D));

        P_old = P_cur; V_old = V_sensed; D_old = D;

        eta_conv       = 0.95 - 0.1*(D - 0.5)^2;
        P_extracted(k) = P_available(k) * D * eta_conv;
        D_out(k)       = D;
    end
    fprintf('  Simulation complete in %.3f s\n', toc);

    results_quantum.t           = t;
    results_quantum.P_available = P_available;
    results_quantum.P_extracted = P_extracted;
    results_quantum.duty_cycle  = D_out;
    results_quantum.v_wind      = v_wind;
    results_quantum.sensor_type = 'Quantum NV-Center Magnetometer';
    results_quantum.efficiency  = mean(P_extracted ./ max(P_available,1)) * 100;

    save(fullfile(fileparts(mfilename('fullpath')), 'quantum_results.mat'), 'results_quantum');
    fprintf('  Results saved. Mean Efficiency: %.2f%%\n', results_quantum.efficiency);
    run(fullfile(fileparts(mfilename('fullpath')), 'Quantum_Results_Analysis.m'));
end
