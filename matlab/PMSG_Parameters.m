%% PMSG_Parameters.m
% =========================================================================
% Shared Parameters for PMSG Quantum-Enhanced MPPT Project
% Project: Quantum-Sensed vs. Classical PMSG Wind Turbine MPPT System
% =========================================================================

%% Simulation Settings
Ts      = 1e-6;      % Fixed time step [s] — 1 µs
T_end   = 6.0;       % Total simulation time [s]

%% PMSG Machine Parameters (5 kW, 3-phase, surface-mount)
P_rated  = 5000;     % Rated power [W]
V_rated  = 220;      % Rated line-to-line voltage (RMS) [V]
n_rated  = 1500;     % Rated speed [RPM]
f_rated  = 50;       % Grid frequency [Hz]
poles    = 6;        % Number of poles (3 pole-pairs)
p        = poles/2;  % Number of pole-pairs

% Electrical parameters
Rs       = 0.5;      % Stator resistance [Ω]
Ld       = 4e-3;     % d-axis inductance [H]
Lq       = 4e-3;     % q-axis inductance [H]
lambda_f = 0.1757;   % PM flux linkage [V·s/rad]

% Mechanical parameters
J        = 0.001;    % Rotor inertia [kg·m²]
B        = 0.001;    % Viscous friction [N·m·s/rad]

% Derived
omega_rated = n_rated * 2*pi / 60;   % Rated mechanical speed [rad/s]
T_rated     = P_rated / omega_rated; % Rated torque [N·m]

%% Wind Turbine Parameters
rho        = 1.225;  % Air density [kg/m³]
R_blade    = 3.0;    % Blade radius [m]
Cp_max     = 0.48;   % Max power coefficient
lambda_opt = 8.1;    % Optimal tip-speed ratio

%% High-Turbulence Wind Profile
% Phase 1 (0-2s): Steady 8 m/s | Phase 2 (2-4s): Gust 14 m/s | Phase 3 (4-6s): 9 m/s
wind_t  = [0, 2.0, 2.001, 4.0, 4.001, T_end];
wind_v  = [8,  8,  14,   14,   9,      9   ];

%% MPPT Parameters (Perturb & Observe)
delta_D  = 0.005;    % Duty cycle step size
D_min    = 0.1;      % Min duty cycle
D_max    = 0.9;      % Max duty cycle
D_init   = 0.5;      % Initial duty cycle

%% Converter Parameters
V_dc     = 400;      % DC bus voltage [V]
f_sw     = 10e3;     % Switching frequency [Hz]
C_dc     = 1000e-6;  % DC link capacitance [F]
L_filter = 1e-3;     % AC filter inductance [H]

%% Classical Sensor Parameters (Hall-effect + encoder)
sensor_noise_classical = 0.05;   % EMI noise amplitude (5% of signal)
sensor_delay_steps     = 50;     % Delay buffer length (50 steps at 1µs Ts)

%% Quantum NV Sensor Parameters (Diamond NV-Center Magnetometer)
sensor_noise_quantum   = 0.001;  % Shot-noise limited (50x less than classical)
sensor_delay_quantum   = 0;      % No delay (microsecond response)

%% Display Summary
fprintf('\n============================================================\n');
fprintf('  PMSG Project Parameters Loaded\n');
fprintf('============================================================\n');
fprintf('  Machine : %.0f W | %.0f V | %.0f RPM | %d poles\n', P_rated, V_rated, n_rated, poles);
fprintf('  Rs=%.2f Ohm | Ld=Lq=%.4f H | lambda_f=%.4f V.s/rad\n', Rs, Ld, lambda_f);
fprintf('  Simulation: Ts=%.1e s | T_end=%.1f s\n', Ts, T_end);
fprintf('  Wind: %.0f -> %.0f -> %.0f m/s (turbulence test)\n', wind_v(1), wind_v(3), wind_v(5));
fprintf('  Classical noise: %.0f%% | Quantum noise: %.1f%%\n', sensor_noise_classical*100, sensor_noise_quantum*100);
fprintf('============================================================\n\n');
