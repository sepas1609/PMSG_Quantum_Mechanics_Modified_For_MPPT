%% Classical_Results_Analysis.m
% =========================================================================
% Post-Simulation Analysis & Visualization — Classical MPPT Results
%
% Loads the saved classical simulation results and generates publication-
% quality figures showing:
%   1. Available wind power vs. extracted power (tracking performance)
%   2. MPPT tracking efficiency over time
%   3. Duty cycle variation
%   4. Wind speed with power overlay
%   5. Statistical summary
%
% Run after run_classical.m or PO_MPPT_Classical.m
% =========================================================================

% Determine file paths
script_dir = fileparts(mfilename('fullpath'));
fig_dir    = fullfile(script_dir, 'figures');
if ~exist(fig_dir, 'dir'); mkdir(fig_dir); end

%% Load Results
results_file = fullfile(script_dir, 'classical_results.mat');
if ~exist(results_file, 'file')
    error(['Results file not found. Please run run_classical.m first.\n' ...
           'Expected: %s'], results_file);
end
load(results_file, 'results_classical');
r = results_classical;

fprintf('\n=== Classical MPPT Analysis ===\n');
fprintf('Sensor Type    : %s\n', r.sensor_type);
fprintf('Simulation Time: %.1f s\n', r.t(end));

%% ── Figure 1: Power Tracking ─────────────────────────────────────────────
fig1 = figure('Name', 'Classical MPPT Power Tracking', 'NumberTitle', 'off', ...
    'Color', [0.10 0.10 0.13], 'Position', [50 50 1100 500]);

ax1 = subplot(1,2,1, 'Parent', fig1);
set(ax1, 'Color', [0.12 0.12 0.15]);
hold(ax1, 'on');

% Shade gust region
patch(ax1, [2 4 4 2], [0 0 max(r.P_available)*1.1 max(r.P_available)*1.1], ...
    [0.4 0.1 0.1], 'EdgeColor', 'none', 'FaceAlpha', 0.3);

plot(ax1, r.t, r.P_available/1000, 'Color', [0.4 0.8 1.0], 'LineWidth', 2, ...
    'DisplayName', 'P_{available} (Wind)');
plot(ax1, r.t, r.P_extracted/1000, 'Color', [1.0 0.45 0.35], 'LineWidth', 1.5, ...
    'DisplayName', 'P_{extracted} (MPPT)');

text(ax1, 3.0, max(r.P_available)/1000 * 0.5, 'Gust Zone\n(Sensor Lag Visible)', ...
    'Color', [1 0.6 0.6], 'HorizontalAlignment', 'center', 'FontSize', 9);

xlabel(ax1, 'Time [s]', 'Color', 'w'); ylabel(ax1, 'Power [kW]', 'Color', 'w');
title(ax1, 'Classical MPPT: Power Tracking', 'Color', 'w', 'FontWeight', 'bold');
legend(ax1, 'Location', 'northwest', 'TextColor', 'w', 'Color', [0.15 0.15 0.18]);
grid(ax1, 'on'); ax1.GridColor = [0.35 0.35 0.35];
ax1.XColor = 'w'; ax1.YColor = 'w';
xlim(ax1, [0 r.t(end)]); ylim(ax1, [0 max(r.P_available)/1000 * 1.15]);

% MPPT Efficiency
ax2 = subplot(1,2,2, 'Parent', fig1);
set(ax2, 'Color', [0.12 0.12 0.15]);
hold(ax2, 'on');

efficiency = (r.P_extracted ./ max(r.P_available, 1)) * 100;
patch(ax2, [2 4 4 2], [0 0 105 105], [0.4 0.1 0.1], 'EdgeColor', 'none', 'FaceAlpha', 0.3);
plot(ax2, r.t, efficiency, 'Color', [0.5 1.0 0.6], 'LineWidth', 1.5);
yline(ax2, mean(efficiency), '--', 'Color', [1 0.85 0.4], 'LineWidth', 2, ...
    'Label', sprintf('Mean: %.1f%%', mean(efficiency)), ...
    'LabelVerticalAlignment', 'bottom', 'LabelHorizontalAlignment', 'right');

xlabel(ax2, 'Time [s]', 'Color', 'w'); ylabel(ax2, 'Efficiency [%]', 'Color', 'w');
title(ax2, 'MPPT Tracking Efficiency', 'Color', 'w', 'FontWeight', 'bold');
grid(ax2, 'on'); ax2.GridColor = [0.35 0.35 0.35];
ax2.XColor = 'w'; ax2.YColor = 'w';
xlim(ax2, [0 r.t(end)]); ylim(ax2, [0 105]);

sgtitle(fig1, '⚡ Classical Sensor PMSG — MPPT Performance Analysis', ...
    'Color', 'w', 'FontSize', 14, 'FontWeight', 'bold');

saveas(fig1, fullfile(fig_dir, 'classical_power_tracking.png'));
fprintf('Figure saved: classical_power_tracking.png\n');

%% ── Figure 2: Duty Cycle & Wind Overlay ─────────────────────────────────
fig2 = figure('Name', 'Classical MPPT Detail', 'NumberTitle', 'off', ...
    'Color', [0.10 0.10 0.13], 'Position', [200 300 1000 400]);

ax3 = subplot(2,1,1, 'Parent', fig2);
set(ax3, 'Color', [0.12 0.12 0.15]);
plot(ax3, r.t, r.v_wind, 'Color', [0.4 0.8 1.0], 'LineWidth', 1.5);
ylabel(ax3, 'Wind [m/s]', 'Color', 'w');
title(ax3, 'Wind Speed', 'Color', 'w'); grid(ax3, 'on');
ax3.GridColor = [0.35 0.35 0.35]; ax3.XColor = 'w'; ax3.YColor = 'w';
xlim(ax3, [0 r.t(end)]);

ax4 = subplot(2,1,2, 'Parent', fig2);
set(ax4, 'Color', [0.12 0.12 0.15]);
plot(ax4, r.t, r.duty_cycle, 'Color', [1.0 0.75 0.3], 'LineWidth', 1.2);
ylabel(ax4, 'Duty Cycle', 'Color', 'w'); xlabel(ax4, 'Time [s]', 'Color', 'w');
title(ax4, 'P&O MPPT Duty Cycle (Classical)', 'Color', 'w'); grid(ax4, 'on');
ax4.GridColor = [0.35 0.35 0.35]; ax4.XColor = 'w'; ax4.YColor = 'w';
xlim(ax4, [0 r.t(end)]); ylim(ax4, [0 1]);

saveas(fig2, fullfile(fig_dir, 'classical_duty_cycle.png'));
fprintf('Figure saved: classical_duty_cycle.png\n');

%% ── Summary Statistics ───────────────────────────────────────────────────
% Gust-zone analysis (t = 2–4 s)
gust_idx = r.t >= 2.0 & r.t <= 4.0;
eta_baseline = mean(efficiency(r.t < 2.0));
eta_gust     = mean(efficiency(gust_idx));
energy_avail = trapz(r.t, r.P_available) / 3600;   % [Wh]
energy_extr  = trapz(r.t, r.P_extracted) / 3600;   % [Wh]

fprintf('\n--- Classical MPPT Statistics ---\n');
fprintf('Overall mean efficiency : %.2f%%\n', mean(efficiency));
fprintf('Baseline efficiency (0-2s): %.2f%%\n', eta_baseline);
fprintf('Gust-zone efficiency (2-4s): %.2f%%\n', eta_gust);
fprintf('Total available energy  : %.4f Wh\n', energy_avail);
fprintf('Total extracted energy  : %.4f Wh\n', energy_extr);
fprintf('Energy capture ratio    : %.2f%%\n', energy_extr/energy_avail*100);
fprintf('---------------------------------\n');
