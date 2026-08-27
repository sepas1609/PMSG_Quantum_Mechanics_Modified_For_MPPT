try
    cd('/Users/saranboddu/Documents/MATLAB/PMSG');
    fprintf('\n--- 1. RUNNING SETUP ---\n');
    setup_project;

    fprintf('\n--- 2. RUNNING BUILD_PMSG_MODELS ---\n');
    build_pmsg_models;

    fprintf('\n--- 3. RUNNING RUN_CLASSICAL ---\n');
    run_classical;

    fprintf('\n--- 4. RUNNING RUN_QUANTUM ---\n');
    run_quantum;

    fprintf('\n--- 5. RUNNING PMSG_COMPARISON_STUDY ---\n');
    PMSG_Comparison_Study;

    fprintf('\n=== ALL COMPLETE SUCCESSFULLY ===\n');
catch e
    fprintf('\n[ERROR OCCURRED]: %s\n', e.message);
    for s = 1:length(e.stack)
        fprintf('  File: %s | Line: %d | Function: %s\n', e.stack(s).file, e.stack(s).line, e.stack(s).name);
    end
end
exit;
