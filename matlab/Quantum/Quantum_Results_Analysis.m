%% Quantum_Results_Analysis.m
% =========================================================================
% Post-Simulation Analysis & Visualization — Quantum MPPT Results
%
% Mirrors Classical_Results_Analysis.m but styled for quantum results.
% Run after run_quantum.m
% =========================================================================

script_dir = fileparts(mfilename('fullpath'));
fig_dir    = fullfile(script_dir, 'figures');
if ~exist(fig_dir, 'dir'); mkdir(fig_dir); end

results_file = fullfile(script_dir, 'quantum_results.mat');
if ~exist(results_file, 'file')
    error('Results not found. Run run_quantum.m first.\nExpected: %s', results_file);
end
load(results_file, 'results_quantum');
r = results_quantum;

fprintf('\n=== Quantum MPPT Analysis ===\n');
fprintf('Sensor Type: %s\n', r.sensor_type);

%% ── Figure 1: Power Tracking ─────────────────────────────────────────────
fig1 = figure('Name', 'Quantum MPPT Power Tracking', 'NumberTitle', 'off', ...
    'Color', [0.10 0.10 0.13], 'Position', [50 50 1100 500]);

ax1 = subplot(1,2,1, 'Parent', fig1);
set(ax1, 'Color', [0.08 0.12 0.08]);
hold(ax1, 'on');
patch(ax1, [2 4 4 2], [0 0 max(r.P_available)*1.1 max(r.P_available)*1.1], ...
    [0.2 0.5 0.1], 'EdgeColor', 'none', 'FaceAlpha', 0.25);
plot(ax1, r.t, r.P_available/1000, 'Color', [0.4 0.8 1.0], 'LineWidth', 2, ...
    'DisplayName', 'P_{available} (Wind)');
plot(ax1, r.t, r.P_extracted/1000, 'Color', [0.4 1.0 0.5], 'LineWidth', 1.5, ...
    'DisplayName', 'P_{extracted} (Quantum MPPT)');
text(ax1, 3.0, max(r.P_available)/1000 * 0.55, 'Gust Zone\nNear-Instant Tracking!', ...
    'Color', [0.5 1 0.6], 'HorizontalAlignment', 'center', 'FontSize', 9);
xlabel(ax1, 'Time [s]', 'Color', 'w'); ylabel(ax1, 'Power [kW]', 'Color', 'w');
title(ax1, 'Quantum NV MPPT: Power Tracking', 'Color', 'w', 'FontWeight', 'bold');
legend(ax1, 'Location', 'northwest', 'TextColor', 'w', 'Color', [0.1 0.15 0.1]);
grid(ax1, 'on'); ax1.GridColor = [0.3 0.4 0.3];
ax1.XColor = 'w'; ax1.YColor = 'w';
xlim(ax1, [0 r.t(end)]); ylim(ax1, [0 max(r.P_available)/1000 * 1.15]);

ax2 = subplot(1,2,2, 'Parent', fig1);
set(ax2, 'Color', [0.08 0.12 0.08]);
hold(ax2, 'on');
efficiency = (r.P_extracted ./ max(r.P_available, 1)) * 100;
patch(ax2, [2 4 4 2], [0 0 105 105], [0.2 0.5 0.1], 'EdgeColor', 'none', 'FaceAlpha', 0.25);
plot(ax2, r.t, efficiency, 'Color', [0.5 1.0 0.6], 'LineWidth', 1.5);
yline(ax2, mean(efficiency), '--', 'Color', [1 0.85 0.4], 'LineWidth', 2, ...
    'Label', sprintf('Mean: %.1f%%', mean(efficiency)), ...
    'LabelVerticalAlignment', 'bottom', 'LabelHorizontalAlignment', 'right');
xlabel(ax2, 'Time [s]', 'Color', 'w'); ylabel(ax2, 'Efficiency [%]', 'Color', 'w');
title(ax2, 'Quantum MPPT Tracking Efficiency', 'Color', 'w', 'FontWeight', 'bold');
grid(ax2, 'on'); ax2.GridColor = [0.3 0.4 0.3];
ax2.XColor = 'w'; ax2.YColor = 'w';
xlim(ax2, [0 r.t(end)]); ylim(ax2, [0 105]);

sgtitle(fig1, '⚛ Quantum NV-Sensor PMSG — MPPT Performance Analysis', ...
    'Color', 'w', 'FontSize', 14, 'FontWeight', 'bold');
saveas(fig1, fullfile(fig_dir, 'quantum_power_tracking.png'));
fprintf('Figure saved: quantum_power_tracking.png\n');

%% ── Summary Statistics ───────────────────────────────────────────────────
gust_idx = r.t >= 2.0 & r.t <= 4.0;
energy_avail = trapz(r.t, r.P_available) / 3600;
energy_extr  = trapz(r.t, r.P_extracted) / 3600;

fprintf('\n--- Quantum MPPT Statistics ---\n');
fprintf('Overall mean efficiency    : %.2f%%\n', mean(efficiency));
fprintf('Baseline efficiency (0-2s) : %.2f%%\n', mean(efficiency(r.t < 2.0)));
fprintf('Gust-zone efficiency (2-4s): %.2f%%\n', mean(efficiency(gust_idx)));
fprintf('Total available energy     : %.4f Wh\n', energy_avail);
fprintf('Total extracted energy     : %.4f Wh\n', energy_extr);
fprintf('Energy capture ratio       : %.2f%%\n', energy_extr/energy_avail*100);
fprintf('-------------------------------\n');
