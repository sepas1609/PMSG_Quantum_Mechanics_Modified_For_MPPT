%% Quantum_NV_Sensor_Model.m
% =========================================================================
% Quantum Nitrogen-Vacancy (NV) Center Sensor — Behavioral Model
%
% Background:
%   Diamond NV centers are atomic-scale spin defects in the carbon lattice.
%   When illuminated by a laser (optical initialization), their electron spin
%   state can be read out optically. The resonance frequency of the spin
%   is exquisitely sensitive to local magnetic fields via the Zeeman effect.
%
%   Key Properties Modeled:
%   ┌─────────────────────────────────────────────────────────────────────┐
%   │  Property              Classical Sensor    Quantum NV Sensor        │
%   │  ──────────────────────────────────────────────────────────────────  │
%   │  Noise level           ±5% (EMI)           ±0.1% (shot-noise only)  │
%   │  Response time         ~50 µs (buffer lag) <1 µs (atomic spin)      │
%   │  EMI immunity          None                Complete (optical read)   │
%   │  Measured quantity     V/I (indirect)      Magnetic flux (direct)    │
%   └─────────────────────────────────────────────────────────────────────┘
%
% This behavioral model implements:
%   1. Direct magnetic flux measurement (no electrical intermediary)
%   2. Shot-noise-limited uncertainty (quantum projection noise)
%   3. Zero communication delay (within one simulation time step)
%   4. Sub-microsecond spin-state readout (faster than Ts = 1 µs)
%
% Reference: Rondin et al., Rep. Prog. Phys. 77, 056503 (2014)
%            Taylor et al., Nature Physics 4, 810–816 (2008)
% =========================================================================

function [sensed_flux, sensed_speed] = quantum_nv_sensor(true_flux, true_speed)
%QUANTUM_NV_SENSOR Diamond NV-Center magnetometer behavioral model
%
%   Inputs:
%     true_flux  - Actual rotor magnetic flux linkage [V·s/rad]
%     true_speed - Actual rotor angular speed [rad/s]
%
%   Outputs:
%     sensed_flux  - Measured flux (shot-noise limited, zero delay) [V·s/rad]
%     sensed_speed - Measured speed (derived from flux derivative) [rad/s]

    % ── Quantum shot noise (fundamental quantum projection noise) ──────────
    % This is the irreducible noise floor determined by quantum mechanics.
    % For NV centers: ~1 nT/√Hz sensitivity → translates to ~0.1% signal noise
    % at the speed and flux magnitudes used in this PMSG model.
    shot_noise_amp = 0.001;   % 0.1% — 50× lower than classical EMI noise

    % ── NV Magnetometer: Directly measures internal rotor magnetic flux ────
    % No need for voltage/current transformations — the NV spins precess at
    % a frequency directly proportional to the local B-field:
    %    f_Zeeman = γ_NV × B_local    (γ_NV = 28 GHz/T for NV centers)
    % This is transformed back to flux and speed in the signal chain.
    quantum_noise_flux  = shot_noise_amp * randn() * max(abs(true_flux),  0.001);
    quantum_noise_speed = shot_noise_amp * randn() * max(abs(true_speed), 0.1);

    % ── Zero-delay output ─────────────────────────────────────────────────
    % The NV center spin polarization readout completes in ~300 ns (far below
    % the 1 µs simulation timestep). No persistent buffer needed.
    sensed_flux  = true_flux  + quantum_noise_flux;
    sensed_speed = true_speed + quantum_noise_speed;

    % ── EMI immunity ──────────────────────────────────────────────────────
    % Unlike Hall-effect sensors or encoders that are susceptible to the
    % strong alternating magnetic fields inside the generator housing,
    % the NV sensor reads spin resonance optically (laser in / fluorescence out).
    % Electromagnetic interference CANNOT couple into the optical channel.
    % (No additional EMI term — this is the key quantum advantage.)
end


%% ── Standalone Comparison Demo ───────────────────────────────────────────
if strcmp(mfilename, 'Quantum_NV_Sensor_Model')
    fprintf('\n--- Quantum NV Sensor Model: Comparison Demo ---\n');

    t = 0:1e-6:0.005;    % 5 ms demonstration
    true_spd = 157 * ones(size(t));   % Constant speed (rated ~1500 RPM)
    true_flx = 0.1757 * ones(size(t));

    % Inject a simulated gust at t = 2 ms
    gust_idx = t > 0.002;
    true_spd(gust_idx) = 200;   % Speed jump simulating gust

    s_flux_cl  = zeros(size(t));  s_speed_cl  = zeros(size(t));
    s_flux_qm  = zeros(size(t));  s_speed_qm  = zeros(size(t));
    spd_buf    = zeros(1, 50);

    for k = 1:length(t)
        % Classical sensor (delay + EMI)
        noise = 0.05 * randn();
        spd_buf = [true_spd(k), spd_buf(1:end-1)];
        s_speed_cl(k) = spd_buf(end) + noise * true_spd(k);
        s_flux_cl(k)  = true_flx(k) + noise * true_flx(k);

        % Quantum NV sensor (no delay, minimal noise)
        [s_flux_qm(k), s_speed_qm(k)] = quantum_nv_sensor(true_flx(k), true_spd(k));
    end

    figure('Name', 'Quantum vs Classical Sensor Comparison', 'Color', [0.1 0.1 0.13], ...
        'Position', [100 100 1000 400]);

    ax1 = subplot(1,2,1); set(ax1, 'Color', [0.12 0.12 0.15]);
    plot(ax1, t*1000, true_spd, 'w-', 'LineWidth', 3, 'DisplayName', 'True Speed');
    hold(ax1, 'on');
    plot(ax1, t*1000, s_speed_cl, 'r--', 'LineWidth', 1.5, 'DisplayName', 'Classical (noisy, delayed)');
    plot(ax1, t*1000, s_speed_qm, 'g-',  'LineWidth', 1.5, 'DisplayName', 'Quantum NV (clean, instant)');
    xlabel(ax1, 'Time [ms]', 'Color', 'w'); ylabel(ax1, 'Speed [rad/s]', 'Color', 'w');
    title(ax1, 'Speed Measurement: Classical vs Quantum', 'Color', 'w');
    legend(ax1, 'TextColor', 'w', 'Color', [0.15 0.15 0.18]); grid(ax1, 'on');
    ax1.GridColor = [0.35 0.35 0.35]; ax1.XColor = 'w'; ax1.YColor = 'w';

    ax2 = subplot(1,2,2); set(ax2, 'Color', [0.12 0.12 0.15]);
    noise_cl = s_speed_cl - true_spd;
    noise_qm = s_speed_qm - true_spd;
    plot(ax2, t*1000, noise_cl, 'r-', 'LineWidth', 1.2, 'DisplayName', ...
        sprintf('Classical RMS=%.1f rad/s', rms(noise_cl)));
    hold(ax2, 'on');
    plot(ax2, t*1000, noise_qm, 'g-', 'LineWidth', 1.2, 'DisplayName', ...
        sprintf('Quantum RMS=%.2f rad/s', rms(noise_qm)));
    xlabel(ax2, 'Time [ms]', 'Color', 'w'); ylabel(ax2, 'Measurement Error [rad/s]', 'Color', 'w');
    title(ax2, 'Sensor Noise Comparison', 'Color', 'w');
    legend(ax2, 'TextColor', 'w', 'Color', [0.15 0.15 0.18]); grid(ax2, 'on');
    ax2.GridColor = [0.35 0.35 0.35]; ax2.XColor = 'w'; ax2.YColor = 'w';
    yline(ax2, 0, 'w--');

    sgtitle('Diamond NV-Center vs Classical Sensor: Noise & Lag Analysis', ...
        'Color', 'w', 'FontSize', 13, 'FontWeight', 'bold');

    fprintf('Classical sensor noise RMS: %.4f rad/s\n', rms(noise_cl));
    fprintf('Quantum sensor noise RMS  : %.4f rad/s\n', rms(noise_qm));
    fprintf('Noise reduction factor    : %.1fx\n', rms(noise_cl)/rms(noise_qm));
end
