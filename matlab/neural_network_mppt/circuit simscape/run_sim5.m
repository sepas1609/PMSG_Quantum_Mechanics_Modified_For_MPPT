mdl = 'WECS_QuadraticBoost_Circuit_v2';
load_system(mdl);
set_param([mdl '/Pout_Scope'], 'SaveToWorkspace', 'on');
set_param([mdl '/Pout_Scope'], 'SaveName', 'Pout_data');
set_param([mdl '/Pout_Scope'], 'DataFormat', 'StructureWithTime');
set_param(mdl, 'StopTime', '10.0'); 
simOut = sim(mdl, 'ReturnWorkspaceOutputs', 'on');
vals = simOut.Pout_data.signals.values;
times = simOut.Pout_data.time;
for i=1:10
    idx = find(times >= i, 1);
    if ~isempty(idx)
        fprintf('Time %f: %f\n', times(idx), vals(idx));
    end
end
