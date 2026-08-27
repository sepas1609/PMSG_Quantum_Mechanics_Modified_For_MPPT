% plot_results.m
disp('Plotting Results...');

load('simulation_results.mat');

% Plot Wind Speed Profile (Figure 9)
figure('Name', 'Wind Speed Input Pattern', 'Position', [100, 100, 600, 300]);
plot(t, V_s, 'b-', 'LineWidth', 1.5);
xlabel('Time (Sec)');
ylabel('Wind Speed (m/s)');
axis([0 10 8 18]);
grid on;
saveas(gcf, 'Fig9_WindSpeed.png');

% Plot Voltage Output (Figure 10)
figure('Name', 'Voltage Output of WECS', 'Position', [100, 100, 1200, 400]);

subplot(1, 3, 1);
plot(t, Vout_boost(1, :), 'r:', 'LineWidth', 1.2); hold on;
plot(t, Vout_boost(2, :), 'b-', 'LineWidth', 1.2);
plot(t, Vout_boost(3, :), 'k--', 'LineWidth', 1.2);
title('(a) Boost Converter');
xlabel('Time (Sec)'); ylabel('Voltage (V)');
axis([0 10 0 450]); grid on;
legend('P&O', 'BPN', 'RBFN', 'Location', 'southeast');

subplot(1, 3, 2);
plot(t, Vout_sepic(1, :), 'r:', 'LineWidth', 1.2); hold on;
plot(t, Vout_sepic(2, :), 'b-', 'LineWidth', 1.2);
plot(t, Vout_sepic(3, :), 'k--', 'LineWidth', 1.2);
title('(b) SEPIC Converter');
xlabel('Time (Sec)'); ylabel('Voltage (V)');
axis([0 10 0 450]); grid on;
legend('P&O', 'BPN', 'RBFN', 'Location', 'southeast');

subplot(1, 3, 3);
plot(t, Vout_qboost(1, :), 'r:', 'LineWidth', 1.2); hold on;
plot(t, Vout_qboost(2, :), 'b-', 'LineWidth', 1.2);
plot(t, Vout_qboost(3, :), 'k--', 'LineWidth', 1.2);
title('(c) Quadratic Boost Converter');
xlabel('Time (Sec)'); ylabel('Voltage (V)');
axis([0 10 0 450]); grid on;
legend('P&O', 'BPN', 'RBFN', 'Location', 'southeast');

saveas(gcf, 'Fig10_VoltageOutput.png');

% Plot Power Output (Figure 11)
figure('Name', 'Power Output of WECS', 'Position', [100, 100, 1200, 400]);

subplot(1, 3, 1);
plot(t, Pout_boost(1, :), 'r:', 'LineWidth', 1.2); hold on;
plot(t, Pout_boost(2, :), 'b-', 'LineWidth', 1.2);
plot(t, Pout_boost(3, :), 'k--', 'LineWidth', 1.2);
title('(a) Boost Converter');
xlabel('Time (Sec)'); ylabel('Power (W)');
axis([0 10 0 3200]); grid on;
legend('P&O', 'BPN', 'RBFN', 'Location', 'southeast');

subplot(1, 3, 2);
plot(t, Pout_sepic(1, :), 'r:', 'LineWidth', 1.2); hold on;
plot(t, Pout_sepic(2, :), 'b-', 'LineWidth', 1.2);
plot(t, Pout_sepic(3, :), 'k--', 'LineWidth', 1.2);
title('(b) SEPIC Converter');
xlabel('Time (Sec)'); ylabel('Power (W)');
axis([0 10 0 3200]); grid on;
legend('P&O', 'BPN', 'RBFN', 'Location', 'southeast');

subplot(1, 3, 3);
plot(t, Pout_qboost(1, :), 'r:', 'LineWidth', 1.2); hold on;
plot(t, Pout_qboost(2, :), 'b-', 'LineWidth', 1.2);
plot(t, Pout_qboost(3, :), 'k--', 'LineWidth', 1.2);
title('(c) Quadratic Boost Converter');
xlabel('Time (Sec)'); ylabel('Power (W)');
axis([0 10 0 3200]); grid on;
legend('P&O', 'BPN', 'RBFN', 'Location', 'southeast');

saveas(gcf, 'Fig11_PowerOutput.png');
disp('Plots generated and saved as PNG files.');
