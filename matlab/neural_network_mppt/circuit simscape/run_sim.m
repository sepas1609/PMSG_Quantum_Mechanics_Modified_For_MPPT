mdl = 'WECS_QuadraticBoost_Circuit_v2';
load_system(mdl);
set_param([mdl '/Pout_Scope'], 'SaveToWorkspace', 'on');
set_param([mdl '/Pout_Scope'], 'SaveName', 'Pout_data');
set_param([mdl '/Pout_Scope'], 'DataFormat', 'StructureWithTime');
set_param(mdl, 'StopTime', '0.1'); 
try
    simOut = sim(mdl, 'ReturnWorkspaceOutputs', 'on');
    disp('Sim succeeded');
    disp(simOut)
catch e
    disp('Sim failed with error:');
    disp(e.message)
end
