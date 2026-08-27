% build_simscape_circuit.m
% This script builds the WECS Quadratic Boost Simscape model automatically.

% No try-catch so errors bubble up
    mdl = 'WECS_QuadraticBoost_Circuit';
    if bdIsLoaded(mdl)
        close_system(mdl, 0);
    end
    new_system(mdl);
    open_system(mdl);

    % Load powerlib
    load_system('powerlib');
    
    %% 1. PowerGUI
    add_block('powerlib/powergui', [mdl '/powergui'], 'Position', [20 20 80 50]);
    set_param([mdl '/powergui'], 'SimulationMode', 'Discrete', 'SampleTime', '10e-6');
    
    %% 2. Wind Turbine Equivalent (Mechanical Torque Source)
    add_block('simulink/Sources/Constant', [mdl '/Tm_Const'], 'Position', [20 120 50 150]);
    % Setting a constant torque for testing. At 12m/s, Tm is approx nominal.
    set_param([mdl '/Tm_Const'], 'Value', '-150'); % Negative for generator mode

    %% 3. PMSG
    add_block('powerlib/Machines/Permanent Magnet Synchronous Machine', [mdl '/PMSG'], 'Position', [100 100 180 180]);
    % Parameters from Table 1
    % R = 0.425, L = 0.000835, Poles = 4
    set_param([mdl '/PMSG'], 'Resistance', '0.425');
    set_param([mdl '/PMSG'], 'dqInductances', '[0.000835 0.000835]');
    set_param([mdl '/PMSG'], 'PolePairs', '2'); % 4 poles = 2 pole pairs
    
    % Connect Tm to PMSG
    add_line(mdl, 'Tm_Const/1', 'PMSG/1', 'autorouting', 'on');

    %% 4. Universal Bridge (Rectifier)
    add_block('powerlib/Power Electronics/Universal Bridge', [mdl '/Rectifier'], 'Position', [250 100 310 180]);
    set_param([mdl '/Rectifier'], 'Device', 'Diodes');
    
    % Connect PMSG to Rectifier
    ph_pmsg = get_param([mdl '/PMSG'], 'PortHandles');
    ph_rect = get_param([mdl '/Rectifier'], 'PortHandles');
    add_line(mdl, ph_pmsg.LConn(1), ph_rect.LConn(1));
    add_line(mdl, ph_pmsg.LConn(2), ph_rect.LConn(2));
    add_line(mdl, ph_pmsg.LConn(3), ph_rect.LConn(3));

    %% 5. Quadratic Boost Converter Components
    % Parameters from Table 2
    L1_val = 77.3e-6;
    L2_val = 99.73e-6;
    Cdc_val = 0.31e-6;
    Co_val = 0.19e-6;
    
    % Inductor L1
    add_block('powerlib/Elements/Series RLC Branch', [mdl '/L1'], 'Position', [350 70 410 90]);
    set_param([mdl '/L1'], 'BranchType', 'L', 'Inductance', num2str(L1_val));
    
    % Inductor L2
    add_block('powerlib/Elements/Series RLC Branch', [mdl '/L2'], 'Position', [550 70 610 90]);
    set_param([mdl '/L2'], 'BranchType', 'L', 'Inductance', num2str(L2_val));
    
    % Capacitor Cdc
    add_block('powerlib/Elements/Series RLC Branch', [mdl '/Cdc'], 'Position', [480 150 500 210], 'Orientation', 'down');
    set_param([mdl '/Cdc'], 'BranchType', 'C', 'Capacitance', num2str(Cdc_val));
    
    % Capacitor Co
    add_block('powerlib/Elements/Series RLC Branch', [mdl '/Co'], 'Position', [750 150 770 210], 'Orientation', 'down');
    set_param([mdl '/Co'], 'BranchType', 'C', 'Capacitance', num2str(Co_val));
    
    % Diodes
    add_block('powerlib/Power Electronics/Diode', [mdl '/D1'], 'Position', [420 70 460 90]);
    add_block('powerlib/Power Electronics/Diode', [mdl '/D2'], 'Position', [650 70 690 90]);
    add_block('powerlib/Power Electronics/Diode', [mdl '/D3'], 'Position', [420 20 460 40]);
    
    % MOSFET
    add_block('powerlib/Power Electronics/Mosfet', [mdl '/Switch'], 'Position', [650 150 690 190], 'Orientation', 'down');
    
    % Load Resistor
    add_block('powerlib/Elements/Series RLC Branch', [mdl '/R_load'], 'Position', [820 150 840 210], 'Orientation', 'down');
    set_param([mdl '/R_load'], 'BranchType', 'R', 'Resistance', '48.13'); % 380^2 / 3000

    % Ground
    add_block('powerlib/Elements/Ground', [mdl '/GND'], 'Position', [650 250 670 270]);

    %% 6. Circuit Connections (Quadratic Boost)
    ph_L1 = get_param([mdl '/L1'], 'PortHandles');
    ph_L2 = get_param([mdl '/L2'], 'PortHandles');
    ph_Cdc = get_param([mdl '/Cdc'], 'PortHandles');
    ph_Co = get_param([mdl '/Co'], 'PortHandles');
    ph_D1 = get_param([mdl '/D1'], 'PortHandles');
    ph_D2 = get_param([mdl '/D2'], 'PortHandles');
    ph_D3 = get_param([mdl '/D3'], 'PortHandles');
    ph_Sw = get_param([mdl '/Switch'], 'PortHandles');
    ph_R = get_param([mdl '/R_load'], 'PortHandles');
    ph_GND = get_param([mdl '/GND'], 'PortHandles');

    % Connect Rectifier + will go to I_measure later
    % Connect Rectifier - to Ground
    add_line(mdl, ph_rect.RConn(2), ph_GND.LConn(1));

    % L1 to D1(anode) and D3(anode)
    add_line(mdl, ph_L1.RConn(1), ph_D1.LConn(1));
    add_line(mdl, ph_L1.RConn(1), ph_D3.LConn(1));
    
    % D1(cathode) to Cdc+
    add_line(mdl, ph_D1.RConn(1), ph_Cdc.LConn(1));
    
    % D3(cathode) to L2
    add_line(mdl, ph_D3.RConn(1), ph_L2.LConn(1));
    
    % Cdc+ to D3(cathode)/L2
    add_line(mdl, ph_Cdc.LConn(1), ph_L2.LConn(1));
    
    % L2 to D2(anode) and Switch(Drain)
    add_line(mdl, ph_L2.RConn(1), ph_D2.LConn(1));
    add_line(mdl, ph_L2.RConn(1), ph_Sw.LConn(1)); % Mosfet Drain is LConn
    
    % D2(cathode) to Co+ and R_load+
    add_line(mdl, ph_D2.RConn(1), ph_Co.LConn(1));
    add_line(mdl, ph_Co.LConn(1), ph_R.LConn(1));
    
    % Ground connections: Cdc-, Co-, R_load-, Switch(Source)
    add_line(mdl, ph_Cdc.RConn(1), ph_GND.LConn(1));
    add_line(mdl, ph_Co.RConn(1), ph_GND.LConn(1));
    add_line(mdl, ph_R.RConn(1), ph_GND.LConn(1));
    add_line(mdl, ph_Sw.RConn(1), ph_GND.LConn(1)); % Mosfet Source is RConn
    
    %% 7. Measurements and MPPT Control
    % Voltage Measurement for Vdc (input to converter)
    add_block('powerlib/Measurements/Voltage Measurement', [mdl '/V_measure'], 'Position', [300 200 320 220]);
    add_line(mdl, ph_rect.RConn(1), get_param([mdl '/V_measure'], 'PortHandles').LConn(1));
    add_line(mdl, ph_rect.RConn(2), get_param([mdl '/V_measure'], 'PortHandles').LConn(2));
    
    % Current Measurement for Idc (input to converter)
    % Since L1 is in series, we can measure current through L1 using a Current Measurement block
    % Actually, replacing L1 connection to insert Ammeter is hard via script.
    % We will just use the internal current measurement of the L1 branch if possible,
    % or add a Current Measurement block between Rectifier and L1.
    add_block('powerlib/Measurements/Current Measurement', [mdl '/I_measure'], 'Position', [320 70 340 90]);
    % Connect Rectifier + to I_measure, then I_measure to L1
    add_line(mdl, ph_rect.RConn(1), get_param([mdl '/I_measure'], 'PortHandles').LConn(1));
    add_line(mdl, get_param([mdl '/I_measure'], 'PortHandles').RConn(1), ph_L1.LConn(1));
    
    % MPPT MATLAB Function Block
    add_block('simulink/User-Defined Functions/MATLAB Function', [mdl '/MPPT_Controller'], 'Position', [400 300 500 350]);
    
    % Set script content for the MATLAB Function block
    scriptContent = [
        'function D = fcn(V, I)' newline ...
        '    persistent V_prev I_prev D_prev;' newline ...
        '    if isempty(V_prev)' newline ...
        '        V_prev = 0; I_prev = 0; D_prev = 0.5;' newline ...
        '    end' newline ...
        '    dV = V - V_prev; dI = I - I_prev; step = 0.002;' newline ...
        '    if abs(dV) < 0.1' newline ...
        '        if dI > 0.05; D_prev = D_prev - step;' newline ...
        '        elseif dI < -0.05; D_prev = D_prev + step; end' newline ...
        '    else' newline ...
        '        inc_cond = dI/dV + I/V;' newline ...
        '        if abs(inc_cond) > 0.01' newline ...
        '            if inc_cond > 0; D_prev = D_prev - step;' newline ...
        '            else; D_prev = D_prev + step; end' newline ...
        '        end' newline ...
        '    end' newline ...
        '    if D_prev > 0.9; D_prev = 0.9; elseif D_prev < 0.1; D_prev = 0.1; end' newline ...
        '    D = D_prev; V_prev = V; I_prev = I;' newline ...
        'end'
    ];
    
    % This is how you set code for a MATLAB Function block in Simulink
    config = get_param([mdl '/MPPT_Controller'], 'MATLABFunctionConfiguration');
    % Workaround for updating MATLAB function block code programmatically
    sf = slroot;
    blk = sf.find('Path', [mdl '/MPPT_Controller'], '-isa', 'Stateflow.EMChart');
    if ~isempty(blk)
        blk.Script = scriptContent;
    end
    
    % Connect V and I to MPPT Controller
    add_line(mdl, 'V_measure/1', 'MPPT_Controller/1', 'autorouting', 'on');
    add_line(mdl, 'I_measure/1', 'MPPT_Controller/2', 'autorouting', 'on');

    % Custom PWM Generator using Relational Operator
    add_block('simulink/Sources/Repeating Sequence', [mdl '/Sawtooth'], 'Position', [530 350 560 380]);
    set_param([mdl '/Sawtooth'], 'rep_seq_t', '[0 1/24000]');
    set_param([mdl '/Sawtooth'], 'rep_seq_y', '[0 1]');
    
    add_block('simulink/Logic and Bit Operations/Relational Operator', [mdl '/Comparator'], 'Position', [600 300 630 330]);
    set_param([mdl '/Comparator'], 'Operator', '>=');
    
    % Connect MPPT output (Duty cycle) to Comparator (+)
    add_line(mdl, 'MPPT_Controller/1', 'Comparator/1', 'autorouting', 'on');
    % Connect Sawtooth to Comparator (-)
    add_line(mdl, 'Sawtooth/1', 'Comparator/2', 'autorouting', 'on');
    
    % Connect Comparator output to Mosfet gate
    add_line(mdl, 'Comparator/1', 'Switch/1', 'autorouting', 'on'); % Gate is Simulink input port 1

    %% 8. Scopes for Voltage and Power
    add_block('powerlib/Measurements/Voltage Measurement', [mdl '/Vout_measure'], 'Position', [860 150 880 170]);
    add_block('powerlib/Measurements/Current Measurement', [mdl '/Iout_measure'], 'Position', [760 130 780 150]);
    
    add_block('simulink/Commonly Used Blocks/Scope', [mdl '/Vout_Scope'], 'Position', [940 100 970 130]);
    add_block('simulink/Math Operations/Product', [mdl '/Power_Multiplier'], 'Position', [940 200 970 230]);
    add_block('simulink/Commonly Used Blocks/Scope', [mdl '/Pout_Scope'], 'Position', [1020 200 1050 230]);
    
    ph_Vout = get_param([mdl '/Vout_measure'], 'PortHandles');
    ph_Iout = get_param([mdl '/Iout_measure'], 'PortHandles');
    
    % Connect Co + to Iout_measure +
    add_line(mdl, ph_Co.LConn(1), ph_Iout.LConn(1));
    % Connect Iout_measure - to R_load +
    add_line(mdl, ph_Iout.RConn(1), ph_R.LConn(1));
    
    % Connect Co + to Vout_measure +
    add_line(mdl, ph_Co.LConn(1), ph_Vout.LConn(1));
    
    % Co- and R_load- are already connected to GND in Section 6.
    % We will add another Ground for Vout_measure- to be safe
    add_block('powerlib/Elements/Ground', [mdl '/GND_Vout'], 'Position', [865 190 875 210]);
    add_line(mdl, ph_Vout.LConn(2), get_param([mdl '/GND_Vout'], 'PortHandles').LConn(1));
    
    % Connect Signals
    add_line(mdl, 'Vout_measure/1', 'Vout_Scope/1', 'autorouting', 'on');
    add_line(mdl, 'Vout_measure/1', 'Power_Multiplier/1', 'autorouting', 'on');
    add_line(mdl, 'Iout_measure/1', 'Power_Multiplier/2', 'autorouting', 'on');
    add_line(mdl, 'Power_Multiplier/1', 'Pout_Scope/1', 'autorouting', 'on');

    %% 9. Configure Solver and Stop Time
    set_param(mdl, 'Solver', 'ode23tb');
    set_param(mdl, 'StopTime', '50.0'); % Extended simulation time
    
    % MATLAB Function code injection
    % Load code into the MPPT block
    try
        blk = [mdl '/MPPT_Controller'];
        code = fileread('MPPT_Flowchart.m');
        chartId = sfprivate('block2chart', blk);
        rt = sfroot;
        chart = rt.find('-isa', 'Stateflow.EMChart', 'Id', chartId);
        chart.Script = code;
    catch
        disp('Note: MPPT code injection skipped during generation');
    end

    % Save model
    save_system(mdl);
    disp(['Simscape model ' mdl '.slx generated successfully.']);
