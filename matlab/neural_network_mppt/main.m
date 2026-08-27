% main.m
disp('Starting WECS Simulation sequence...');
try
    generate_training_data;
    train_networks;
    simulate_wecs;
    plot_results;
    disp('WECS Simulation completed successfully.');
catch e
    disp('An error occurred during simulation:');
    disp(e.message);
    rethrow(e);
end
