%% Classical_Sensor_Model.m
% =========================================================================
% Classical Sensor Behavioral Model
% Models: Hall-effect current sensor + optical rotary encoder
%
% Limitations modeled:
%   1. EMI Noise      - Electromagnetic interference inside the generator
%                       housing corrupts the measured signal (±5% amplitude)
%   2. Communication Delay - Digital encoder/sensor data transmitted over
%                       serial bus: ~50 µs effective lag at Ts = 1 µs
%
% Usage (standalone test):
%   [sensed_flux, sensed_speed] = classical_sensor(true_flux, true_speed)
% =========================================================================

function [sensed_flux, sensed_speed] = classical_sensor(true_flux, true_speed)
%CLASSICAL_SENSOR Applies EMI noise + communication delay to true signals
%
%   Inputs:
%     true_flux  - Actual rotor magnetic flux [V·s/rad]
%     true_speed - Actual rotor angular speed [rad/s]
%
%   Outputs:
%     sensed_flux  - Measured flux (with noise + delay)
%     sensed_speed - Measured speed (with noise + delay)

    % Noise amplitude (5% of signal — typical EMI inside generator)
    noise_amp = 0.05;

    % --- Delay buffer (persistent across function calls) ---
    % Simulates 50-step communication lag (~50 µs at Ts=1 µs, or ~2-5 ms at slower rates)
    persistent speed_buffer flux_buffer;
    if isempty(speed_buffer)
        speed_buffer = zeros(1, 50);   % 50-step FIFO queue
        flux_buffer  = zeros(1, 50);
    end

    % Shift new value into front of buffer (FIFO)
    speed_buffer = [true_speed, speed_buffer(1:end-1)];
    flux_buffer  = [true_flux,  flux_buffer(1:end-1)];

    % Output is the delayed tail of the buffer + noise
    noise_speed = noise_amp * randn();
    noise_flux  = noise_amp * randn();

    sensed_speed = speed_buffer(end) + noise_speed * max(abs(true_speed), 1);
    sensed_flux  = flux_buffer(end)  + noise_flux  * max(abs(true_flux), 0.01);
end


%% ── Standalone Test / Demo ───────────────────────────────────────────────
% Run this section directly to see classical sensor behaviour
if ~isdeployed && ~exist('OCTAVE_VERSION','builtin')
    % Only runs when script is executed directly (not called as a function)
    is_main = strcmp(mfilename, 'Classical_Sensor_Model');
    if is_main
        fprintf('\n--- Classical Sensor Model: Standalone Test ---\n');

        t = 0:1e-6:0.01;    % 10 ms test
        true_spd = 100 * sin(2*pi*50*t) + 157;   % Simulated speed signal

        s_flux  = zeros(size(t));
        s_speed = zeros(size(t));

        for k = 1:length(t)
            [s_flux(k), s_speed(k)] = classical_sensor(0.1757, true_spd(k));
        end

        figure('Name','Classical Sensor Model Test','NumberTitle','off');
        plot(t*1000, true_spd, 'b-', 'LineWidth', 2, 'DisplayName','True Speed'); hold on;
        plot(t*1000, s_speed, 'r--', 'LineWidth', 1.5, 'DisplayName','Sensed Speed (Classical)');
        xlabel('Time [ms]'); ylabel('Speed [rad/s]');
        title('Classical Sensor: EMI Noise + Communication Delay');
        legend('Location','best'); grid on;
        fprintf('Test complete. Note the noise and lag in the red curve.\n');
    end
end
