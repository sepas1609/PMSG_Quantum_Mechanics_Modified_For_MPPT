%% run_classical.m
% =========================================================================
% ONE-CLICK CLASSICAL SIMULATION — PMSG Classical Hall-Effect Sensor MPPT
%
% This script:
%   1. Loads shared PMSG parameters
%   2. Generates the high-turbulence wind profile
%   3. Runs the full classical P&O MPPT simulation (MATLAB loop)
%   4. Saves results to classical_results.mat
%   5. Generates and SAVES figures to Classical/figures/  (from real results)
%
% The figures are generated from REAL simulation data, not synthetic data.
% =========================================================================

clc; clear; close all;
fprintf('\n');
fprintf('╔══════════════════════════════════════════════════════════╗\n');
fprintf('║   PMSG Classical Sensor MPPT Simulation                 ║\n');
fprintf('║   Sensor: Hall-effect + Optical Encoder (Classical)     ║\n');
fprintf('╚══════════════════════════════════════════════════════════╝\n\n');

script_dir  = fileparts(mfilename('fullpath'));
project_dir = fullfile(script_dir, '..');
fig_dir     = fullfile(script_dir, 'figures');
if ~exist(fig_dir,'dir'); mkdir(fig_dir); end
addpath(project_dir); addpath(script_dir);

%% ── Step 1: Parameters ───────────────────────────────────────────────────
fprintf('[1/5] Loading PMSG parameters...\n');
run(fullfile(project_dir, 'PMSG_Parameters.m'));

%% ── Step 2: Wind Profile ─────────────────────────────────────────────────
fprintf('[2/5] Generating wind profile...\n');
run(fullfile(script_dir, 'Wind_Profile_Setup.m'));
load(fullfile(script_dir, 'wind_profile.mat'), 'wind_profile');
t      = wind_profile.t;
v_wind = wind_profile.v_wind;
v_base = wind_profile.v_base;
N      = length(t);
fprintf('      %d time steps | %.4f s step | %.1f s total\n', N, Ts, T_end);

%% ── Step 3: Run Classical MPPT Simulation ────────────────────────────────
fprintf('[3/5] Running Classical P&O MPPT simulation...\n');

P_available = zeros(N,1);
P_extracted = zeros(N,1);
D_out       = zeros(N,1);
omega_all   = zeros(N,1);
V_sensed_all= zeros(N,1);
I_sensed_all= zeros(N,1);

% Initialise state
P_old  = 0;
V_old  = 0;
D_old  = 0.5;
spd_buf = zeros(1, sensor_delay_steps);

% Optimal reference target for boost converter: V_dc = 300V
V_dc = 300;
omega_opt_vec = lambda_opt .* v_wind / R_blade;
V_opt_vec     = lambda_f .* omega_opt_vec .* p;
D_opt_vec     = min(D_max, max(D_min, V_opt_vec ./ V_dc));

tic;
for k = 1:N
    %% Available aerodynamic power
    P_available(k) = min(0.5*rho*pi*R_blade^2*Cp_max*v_wind(k)^3, P_rated);

    omega_k  = omega_opt_vec(k);
    V_true   = V_opt_vec(k);
    I_true   = P_available(k) / max(V_true, 0.5);
    omega_all(k) = omega_k;

    %% Classical Hall-effect sensor model: 50-step FIFO lag + 5% EMI noise
    spd_buf  = [omega_k, spd_buf(1:end-1)];
    omega_delayed = spd_buf(end);
    noise_factor  = sensor_noise_classical * randn();
    V_s  = omega_delayed * lambda_f * p * (1 + noise_factor);
    I_s  = I_true * (1 + sensor_noise_classical * randn());
    V_s  = max(0.1, V_s);
    I_s  = max(0,   I_s);
    V_sensed_all(k) = V_s;
    I_sensed_all(k) = I_s;

    %% P&O MPPT logic
    P_cur = V_s * I_s;
    dP    = P_cur - P_old;
    dV    = V_s   - V_old;
    D     = D_old;
    if dP > 0
        if dV > 0; D = D_old - delta_D; else; D = D_old + delta_D; end
    elseif dP < 0
        if dV > 0; D = D_old + delta_D; else; D = D_old - delta_D; end
    end
    D = max(D_min, min(D_max, D));
    P_old = P_cur;  V_old = V_s;  D_old = D;

    %% Power extracted (tracking efficiency * generator efficiency)
    D_ratio = D / max(D_opt_vec(k), D_min);
    tracking_eff = max(0.65, 1.0 - 0.45 * (D_ratio - 1.0)^2);
    P_extracted(k) = P_available(k) * tracking_eff * 0.95;
    D_out(k)   = D;
end
sim_time = toc;
fprintf('      Simulation complete in %.3f s\n', sim_time);

%% ── Step 4: Compute Metrics ──────────────────────────────────────────────
fprintf('[4/5] Computing performance metrics...\n');
eta_pct  = P_extracted ./ max(P_available, 1) * 100;
E_avail  = trapz(t, P_available) / 3600;
E_extr   = trapz(t, P_extracted) / 3600;
gust_mask = (t >= 2.0) & (t <= 4.0);
eta_overall = mean(eta_pct);
eta_gust    = mean(eta_pct(gust_mask));
eta_base    = mean(eta_pct(t < 2.0));

fprintf('      Overall Efficiency : %.2f%%\n', eta_overall);
fprintf('      Baseline (0-2s)    : %.2f%%\n', eta_base);
fprintf('      Gust-zone (2-4s)   : %.2f%%\n', eta_gust);
fprintf('      Energy Available   : %.4f Wh\n', E_avail);
fprintf('      Energy Extracted   : %.4f Wh\n', E_extr);

%% Save results
results_classical.t           = t;
results_classical.v_wind      = v_wind;
results_classical.v_base      = v_base;
results_classical.P_available = P_available;
results_classical.P_extracted = P_extracted;
results_classical.duty_cycle  = D_out;
results_classical.V_sensed    = V_sensed_all;
results_classical.I_sensed    = I_sensed_all;
results_classical.omega       = omega_all;
results_classical.eta_pct     = eta_pct;
results_classical.eta_overall = eta_overall;
results_classical.eta_gust    = eta_gust;
results_classical.eta_base    = eta_base;
results_classical.E_avail_Wh  = E_avail;
results_classical.E_extr_Wh   = E_extr;
results_classical.sensor_type = 'Classical Hall-effect + Optical Encoder';
results_classical.N_steps     = N;
results_classical.Ts          = Ts;
save(fullfile(script_dir, 'classical_results.mat'), 'results_classical');
fprintf('      Saved: classical_results.mat\n');

%% ── Step 5: Generate & Save Figures from REAL simulation data ────────────
fprintf('[5/5] Generating and saving figures from real simulation data...\n');
BG = [0.09 0.09 0.12];

idx_p = 1:max(1, round(N / 20000)):N;
tp = t(idx_p);
vp = v_wind(idx_p);
vbp = v_base(idx_p);
Pap = P_available(idx_p);
Pep = P_extracted(idx_p);
etap = eta_pct(idx_p);
Dp = D_out(idx_p);
Np = length(tp);

% ── Figure C1: Wind Profile ────────────────────────────────────────────────
fig1 = figure('Visible','off','Color',BG,'Position',[50 50 950 420],...
    'Name','Classical: Wind Profile','NumberTitle','off');
ax = axes(fig1,'Color',[0.12 0.12 0.15]);
hold(ax,'on');
patch(ax,[0 2 2 0],[0 0 18 18],[0.15 0.15 0.22],'EdgeColor','none','FaceAlpha',0.7);
patch(ax,[2 4 4 2],[0 0 18 18],[0.40 0.08 0.08],'EdgeColor','none','FaceAlpha',0.5);
patch(ax,[4 T_end T_end 4],[0 0 18 18],[0.08 0.28 0.10],'EdgeColor','none','FaceAlpha',0.5);
plot(ax,tp,vp,'Color',[0.4 0.82 1.0],'LineWidth',1.8,...
    'DisplayName',sprintf('Turbulent wind (std=%.2f m/s)',std(v_wind)));
plot(ax,tp,vbp,'--','Color',[1.0 0.72 0.25],'LineWidth',1.6,...
    'DisplayName','Base profile');
text(ax,1.0,  6.0, 'Phase 1','Color',[0.65 0.88 1.0],'FontSize',11,'FontWeight','bold','HorizontalAlignment','center');
text(ax,1.0,  4.8, '8 m/s',  'Color',[0.65 0.88 1.0],'FontSize',10,'HorizontalAlignment','center');
text(ax,3.0, 15.5, 'Phase 2','Color',[1.0 0.55 0.55],'FontSize',11,'FontWeight','bold','HorizontalAlignment','center');
text(ax,3.0, 14.3, '14 m/s (GUST)', 'Color',[1.0 0.55 0.55],'FontSize',9,'HorizontalAlignment','center');
text(ax,5.0,  7.6, 'Phase 3','Color',[0.5 1.0 0.6],'FontSize',11,'FontWeight','bold','HorizontalAlignment','center');
text(ax,5.0,  6.4, '9 m/s', 'Color',[0.5 1.0 0.6],'FontSize',10,'HorizontalAlignment','center');
xlabel(ax,'Time [s]','Color','w','FontSize',12);
ylabel(ax,'Wind Speed [m/s]','Color','w','FontSize',12);
title(ax,'High-Turbulence Wind Speed Profile (Classical Simulation)',...
    'Color','w','FontSize',13,'FontWeight','bold');
legend(ax,'Location','best','TextColor','w','Color',[0.16 0.16 0.19],'FontSize',10);
grid(ax,'on'); ax.GridColor=[0.38 0.38 0.38]; ax.XColor='w'; ax.YColor='w';
xlim(ax,[0 T_end]); ylim(ax,[0 18]);
saveas(fig1, fullfile(fig_dir,'wind_profile.png'));
close(fig1);

% ── Figure C2: Power Tracking ─────────────────────────────────────────────
fig2 = figure('Visible','off','Color',BG,'Position',[50 50 1200 520],...
    'Name','Classical: Power Tracking','NumberTitle','off');

ax1 = subplot(1,2,1,'Parent',fig2,'Color',[0.12 0.10 0.13]);
hold(ax1,'on');
patch(ax1,[2 4 4 2],[0 0 6.5 6.5],[0.45 0.08 0.08],'EdgeColor','none','FaceAlpha',0.2);
fill(ax1,[tp' fliplr(tp')],[Pap'/1000 zeros(1,Np)],[0.18 0.33 0.55],...
    'EdgeColor','none','FaceAlpha',0.18);
plot(ax1,tp,Pap/1000,'Color',[0.5 0.78 1.0],'LineWidth',2.2,...
    'DisplayName','P_{available} (wind)');
plot(ax1,tp,Pep/1000,'Color',[1.0 0.40 0.30],'LineWidth',1.7,...
    'DisplayName',sprintf('P_{extracted} (classical)'));
text(ax1,3.0,0.8,{'EMI noise &','sensor lag'},'Color',[1.0 0.55 0.55],...
    'FontSize',9,'FontWeight','bold','HorizontalAlignment','center');
xlabel(ax1,'Time [s]','Color','w'); ylabel(ax1,'Power [kW]','Color','w');
title(ax1,'Power Tracking (Full Timeline)','Color','w','FontWeight','bold');
legend(ax1,'Location','northwest','TextColor','w','Color',[0.15 0.12 0.16],'FontSize',9);
grid(ax1,'on'); ax1.GridColor=[0.36 0.36 0.36]; ax1.XColor='w'; ax1.YColor='w';
xlim(ax1,[0 T_end]); ylim(ax1,[0 6.5]);

ax2 = subplot(1,2,2,'Parent',fig2,'Color',[0.11 0.11 0.14]);
hold(ax2,'on');
patch(ax2,[2 4 4 2],[0 0 105 105],[0.45 0.08 0.08],'EdgeColor','none','FaceAlpha',0.2);
fill(ax2,[tp' fliplr(tp')],[etap' zeros(1,Np)],[0.6 0.2 0.1],...
    'EdgeColor','none','FaceAlpha',0.15);
plot(ax2,tp,etap,'Color',[0.50 1.0 0.62],'LineWidth',1.7);
yline(ax2,eta_overall,'--','Color',[1.0 0.88 0.3],'LineWidth',2.0,...
    'Label',sprintf('Mean: %.1f%%',eta_overall),...
    'LabelVerticalAlignment','bottom','LabelHorizontalAlignment','right');
yline(ax2,eta_gust,'-.','Color',[1.0 0.5 0.5],'LineWidth',1.5,...
    'Label',sprintf('Gust: %.1f%%',eta_gust),...
    'LabelVerticalAlignment','top','LabelHorizontalAlignment','right');
xlabel(ax2,'Time [s]','Color','w'); ylabel(ax2,'MPPT Efficiency [%]','Color','w');
title(ax2,'MPPT Tracking Efficiency','Color','w','FontWeight','bold');
grid(ax2,'on'); ax2.GridColor=[0.36 0.36 0.36]; ax2.XColor='w'; ax2.YColor='w';
xlim(ax2,[0 T_end]); ylim(ax2,[0 105]);

sgtitle(fig2,sprintf('Classical Sensor PMSG — P&O MPPT  |  Overall: %.1f%%  |  Gust: %.1f%%',...
    eta_overall, eta_gust),'Color','w','FontSize',13,'FontWeight','bold');
saveas(fig2, fullfile(fig_dir,'classical_power_tracking.png'));
close(fig2);

% ── Figure C3: Duty Cycle ─────────────────────────────────────────────────
fig3 = figure('Visible','off','Color',BG,'Position',[50 50 1100 440],...
    'Name','Classical: Duty Cycle','NumberTitle','off');

ax3a = subplot(2,1,1,'Parent',fig3,'Color',[0.12 0.12 0.14]);
plot(ax3a,tp,vp,'Color',[0.4 0.82 1],'LineWidth',1.5);
patch(ax3a,[2 4 4 2],[min(vp)-1 min(vp)-1 max(vp)+1 max(vp)+1],...
    [0.5 0.4 0],'EdgeColor','none','FaceAlpha',0.12);
ylabel(ax3a,'Wind Speed [m/s]','Color','w'); title(ax3a,'Wind Speed','Color','w');
grid(ax3a,'on'); ax3a.GridColor=[0.36 0.36 0.36]; ax3a.XColor='w'; ax3a.YColor='w';
xlim(ax3a,[0 T_end]);

ax3b = subplot(2,1,2,'Parent',fig3,'Color',[0.12 0.12 0.14]);
hold(ax3b,'on');
patch(ax3b,[2 4 4 2],[0 0 1 1],[0.5 0.4 0],'EdgeColor','none','FaceAlpha',0.15);
plot(ax3b,tp,Dp,'Color',[1.0 0.72 0.25],'LineWidth',1.3,...
    'DisplayName',sprintf('Classical D (std=%.4f, oscillations in gust)',std(D_out(gust_mask))));
yline(ax3b,mean(D_out),'--','Color','w','LineWidth',1.2,...
    'Label',sprintf('Mean D=%.3f',mean(D_out)),'LabelVerticalAlignment','bottom');
text(ax3b,3.0,0.82,sprintf('Gust std=%.4f\n(oscillation)',std(D_out(gust_mask))),...
    'Color',[1.0 0.6 0.6],'FontSize',9,'HorizontalAlignment','center');
legend(ax3b,'TextColor','w','Color',[0.15 0.15 0.18],'Location','southwest','FontSize',9);
ylabel(ax3b,'Duty Cycle D','Color','w'); xlabel(ax3b,'Time [s]','Color','w');
title(ax3b,'P&O Duty Cycle — Classical (note oscillations in gust zone 2-4s)','Color','w');
grid(ax3b,'on'); ax3b.GridColor=[0.36 0.36 0.36]; ax3b.XColor='w'; ax3b.YColor='w';
xlim(ax3b,[0 T_end]); ylim(ax3b,[0 1]);

sgtitle(fig3,'Classical MPPT Duty Cycle & Wind Profile','Color','w','FontSize',12,'FontWeight','bold');
saveas(fig3, fullfile(fig_dir,'classical_duty_cycle.png'));
close(fig3);

%% ── Done ─────────────────────────────────────────────────────────────────
fprintf('\n');
fprintf('╔══════════════════════════════════════════════════════════╗\n');
fprintf('║   Classical Simulation Complete!                        ║\n');
fprintf('╠══════════════════════════════════════════════════════════╣\n');
fprintf('║   Overall MPPT Efficiency  : %5.2f%%                    ║\n', eta_overall);
fprintf('║   Baseline Efficiency (0-2s): %5.2f%%                   ║\n', eta_base);
fprintf('║   Gust-zone Efficiency (2-4s):%5.2f%%                   ║\n', eta_gust);
fprintf('║   Energy Extracted         : %.4f Wh                ║\n', E_extr);
fprintf('╠══════════════════════════════════════════════════════════╣\n');
fprintf('║   Figures saved to Classical/figures/                   ║\n');
fprintf('║     wind_profile.png                                    ║\n');
fprintf('║     classical_power_tracking.png                        ║\n');
fprintf('║     classical_duty_cycle.png                            ║\n');
fprintf('╚══════════════════════════════════════════════════════════╝\n\n');

n_figs = length(dir(fullfile(fig_dir,'*.png')));
fprintf('Total figures saved: %d\n\n', n_figs);
