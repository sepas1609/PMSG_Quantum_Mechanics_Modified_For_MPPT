%% setup_project.m
% =========================================================================
% PROJECT SETUP — PMSG Quantum-Enhanced MPPT System
% Run this ONCE when you first open the project in MATLAB.
%
% What this does:
%   1. Adds all project folders to the MATLAB path
%   2. Checks for required toolboxes
%   3. Verifies the folder structure
%   4. Optionally runs a quick parameter check
% =========================================================================

clc;
fprintf('\n');
fprintf('╔══════════════════════════════════════════════════════════════╗\n');
fprintf('║   PMSG Quantum MPPT Project Setup                          ║\n');
fprintf('║   Amrita Vishwa Vidyapeetham | Year 3 Project              ║\n');
fprintf('╚══════════════════════════════════════════════════════════════╝\n\n');

%% ── Paths ────────────────────────────────────────────────────────────────
project_dir = fileparts(mfilename('fullpath'));
addpath(project_dir);
addpath(fullfile(project_dir, 'Classical'));
addpath(fullfile(project_dir, 'Quantum'));
addpath(fullfile(project_dir, 'Classical', 'figures'));
addpath(fullfile(project_dir, 'Quantum', 'figures'));
addpath(fullfile(project_dir, 'Comparison_Figures'));
addpath(fullfile(project_dir, 'neural_network_mppt'));
fprintf('[1/4] Added project folders to MATLAB path.\n');

%% ── Toolbox Check ────────────────────────────────────────────────────────
fprintf('[2/4] Checking required toolboxes...\n');
required_tb = {'Simulink', 'Simscape', 'Simscape Electrical', 'Control System Toolbox'};
v = ver;
names = {v.Name};
for i = 1:length(required_tb)
    tb = required_tb{i};
    if any(strcmpi(names, tb))
        fprintf('  [✓]  %s\n', tb);
    else
        if i <= 3
            fprintf('  [!]  %-35s — REQUIRED (some features may be limited)\n', tb);
        else
            fprintf('  [-]  %-35s — Optional\n', tb);
        end
    end
end

%% ── File Structure Check ─────────────────────────────────────────────────
fprintf('[3/4] Verifying file structure...\n');
files_to_check = {
    'PMSG_Parameters.m',            'Shared parameters';
    'PMSG_Comparison_Study.m',      'Main comparison script';
    'build_pmsg_models.m',          'Simscape model builder';
    fullfile('Classical','Classical_Sensor_Model.m'),   'Classical sensor model';
    fullfile('Classical','PO_MPPT_Classical.m'),        'Classical MPPT controller';
    fullfile('Classical','Wind_Profile_Setup.m'),       'Wind profile generator';
    fullfile('Classical','Classical_Results_Analysis.m'),'Classical analysis';
    fullfile('Classical','run_classical.m'),            'Classical run script';
    fullfile('Quantum','Quantum_NV_Sensor_Model.m'),    'Quantum NV sensor model';
    fullfile('Quantum','PO_MPPT_Quantum.m'),            'Quantum MPPT controller';
    fullfile('Quantum','Quantum_Results_Analysis.m'),   'Quantum analysis';
    fullfile('Quantum','run_quantum.m'),                'Quantum run script';
};
all_found = true;
for i = 1:size(files_to_check, 1)
    fpath = fullfile(project_dir, files_to_check{i,1});
    if exist(fpath, 'file')
        fprintf('  [✓]  %s\n', files_to_check{i,2});
    else
        fprintf('  [!]  %-40s — MISSING: %s\n', files_to_check{i,2}, files_to_check{i,1});
        all_found = false;
    end
end

%% ── Load Parameters ──────────────────────────────────────────────────────
fprintf('[4/4] Loading PMSG parameters...\n');
run(fullfile(project_dir, 'PMSG_Parameters.m'));

%% ── Instructions ─────────────────────────────────────────────────────────
fprintf('\n');
fprintf('╔══════════════════════════════════════════════════════════════╗\n');
fprintf('║   Setup Complete! Here is what to do next:                 ║\n');
fprintf('╠══════════════════════════════════════════════════════════════╣\n');
fprintf('║                                                             ║\n');
fprintf('║  STEP 1 — Build Simscape .slx models:                      ║\n');
fprintf('║    >> build_pmsg_models                                     ║\n');
fprintf('║                                                             ║\n');
fprintf('║  STEP 2 — Run Classical simulation:                         ║\n');
fprintf('║    >> run_classical                                         ║\n');
fprintf('║                                                             ║\n');
fprintf('║  STEP 3 — Run Quantum simulation:                           ║\n');
fprintf('║    >> run_quantum                                           ║\n');
fprintf('║                                                             ║\n');
fprintf('║  STEP 4 — Full comparison (main presentation figures):      ║\n');
fprintf('║    >> PMSG_Comparison_Study                                 ║\n');
fprintf('║                                                             ║\n');
fprintf('║  STEP 5 — Open Simscape models visually:                    ║\n');
fprintf('║    >> open(''Classical/PMSG_Classical_Main.slx'')           ║\n');
fprintf('║    >> open(''Quantum/PMSG_Quantum_Main.slx'')               ║\n');
fprintf('║                                                             ║\n');
fprintf('╚══════════════════════════════════════════════════════════════╝\n\n');
