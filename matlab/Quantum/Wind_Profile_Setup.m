%% Wind_Profile_Setup.m
% =========================================================================
% High-Turbulence Wind Profile Generator
%
% Generates a three-phase wind speed profile designed to stress-test
% the difference between classical and quantum MPPT controllers:
%
%   Phase 1 (0–2 s)  : Steady 8 m/s  → Baseline / warm-up
%   Phase 2 (2–4 s)  : Sharp gust to 14 m/s (75% increase in 1 ms)
%                      → This is where classical sensors FAIL (delay causes
%                        wild oscillations; quantum sensors track instantly)
%   Phase 3 (4–6 s)  : Drop to 9 m/s (recovery assessment)
%
% Additional optional turbulence can be superimposed for realism.
% =========================================================================

% Load shared parameters
run(fullfile(fileparts(mfilename('fullpath')), '..', 'PMSG_Parameters.m'));

% Time vector (high resolution for 1 µs Ts)
t = (0:Ts:T_end)';

%% ── Base Wind Profile (Step changes) ─────────────────────────────────────
v_base = interp1(wind_t, wind_v, t, 'previous', wind_v(end));

%% ── Superimpose Turbulence (optional — toggle with flag) ─────────────────
ADD_TURBULENCE = true;   % Set false for clean step profile

if ADD_TURBULENCE
    % Add stochastic turbulence using filtered white noise (von Kármán model)
    turbulence_intensity = 0.08;     % 8% turbulence intensity (typical offshore)
    rand_seed = 42;                  % Reproducible results
    rng(rand_seed);

    % Generate colored noise (low-pass filtered white noise to model wind turbulence)
    white_noise = randn(size(t));
    % Simple 1st-order IIR low-pass filter (time constant = 0.5 s)
    tau_turb = 0.5;
    alpha_turb = exp(-Ts / tau_turb);
    turb = zeros(size(t));
    for k = 2:length(t)
        turb(k) = alpha_turb * turb(k-1) + (1 - alpha_turb) * white_noise(k);
    end
    % Scale turbulence relative to base wind speed
    v_turbulence = turbulence_intensity * v_base .* turb;
    v_wind_final = max(0, v_base + v_turbulence);   % Wind speed ≥ 0
else
    v_wind_final = v_base;
end

%% ── Save Wind Profile ────────────────────────────────────────────────────
wind_profile.t            = t;
wind_profile.v_wind       = v_wind_final;
wind_profile.v_base       = v_base;
wind_profile.add_turb     = ADD_TURBULENCE;
wind_profile.gust_time    = 2.0;    % [s] Time of gust onset
wind_profile.gust_speed   = 14.0;   % [m/s]
wind_profile.steady_speed = 8.0;    % [m/s]
wind_profile.recover_spd  = 9.0;    % [m/s]

save(fullfile(fileparts(mfilename('fullpath')), 'wind_profile.mat'), 'wind_profile');
fprintf('Wind profile saved: %.0f -> %.0f -> %.0f m/s | Turbulence: %d\n', ...
    wind_profile.steady_speed, wind_profile.gust_speed, wind_profile.recover_spd, ...
    ADD_TURBULENCE);

%% ── Plot Wind Profile ────────────────────────────────────────────────────
fig_wind = figure('Name', 'Wind Speed Profile', 'NumberTitle', 'off', ...
    'Color', [0.12 0.12 0.15], 'Position', [100 100 900 400]);

ax = axes('Parent', fig_wind, 'Color', [0.12 0.12 0.15]);
hold(ax, 'on');

% Shade regions
patch(ax, [0 2 2 0], [0 0 20 20], [0.18 0.18 0.22], 'EdgeColor', 'none', 'FaceAlpha', 0.5);
patch(ax, [2 4 4 2], [0 0 20 20], [0.25 0.12 0.12], 'EdgeColor', 'none', 'FaceAlpha', 0.5);
patch(ax, [4 6 6 4], [0 0 20 20], [0.12 0.22 0.14], 'EdgeColor', 'none', 'FaceAlpha', 0.5);

% Plot wind speed
plot(ax, t, v_wind_final, 'Color', [0.4 0.8 1.0], 'LineWidth', 1.5, ...
    'DisplayName', 'Wind Speed (with turbulence)');
if ADD_TURBULENCE
    plot(ax, t, v_base, '--', 'Color', [1 0.7 0.3], 'LineWidth', 1.5, ...
        'DisplayName', 'Base Profile (step)');
end

% Annotations
text(ax, 1.0, 7.0, 'Phase 1\nSteady 8 m/s', 'Color', [0.7 0.9 1], ...
    'HorizontalAlignment', 'center', 'FontSize', 10, 'FontWeight', 'bold');
text(ax, 3.0, 15.0, 'Phase 2\nGust 14 m/s', 'Color', [1 0.5 0.5], ...
    'HorizontalAlignment', 'center', 'FontSize', 10, 'FontWeight', 'bold');
text(ax, 5.0, 8.0, 'Phase 3\nRecover 9 m/s', 'Color', [0.5 1 0.6], ...
    'HorizontalAlignment', 'center', 'FontSize', 10, 'FontWeight', 'bold');

xlabel(ax, 'Time [s]', 'Color', 'w', 'FontSize', 12);
ylabel(ax, 'Wind Speed [m/s]', 'Color', 'w', 'FontSize', 12);
title(ax, 'High-Turbulence Wind Speed Profile (PMSG Stress Test)', ...
    'Color', 'w', 'FontSize', 14, 'FontWeight', 'bold');
legend(ax, 'Location', 'best', 'TextColor', 'w', 'Color', [0.15 0.15 0.18]);
grid(ax, 'on'); ax.GridColor = [0.4 0.4 0.4];
ax.XColor = 'w'; ax.YColor = 'w';
xlim(ax, [0 T_end]); ylim(ax, [0 18]);

% Save figure
saveas(fig_wind, fullfile(fileparts(mfilename('fullpath')), 'figures', 'wind_profile.png'));
fprintf('Wind profile figure saved.\n');
