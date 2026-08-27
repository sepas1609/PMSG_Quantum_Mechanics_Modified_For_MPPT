% train_networks.m
disp('Training BPNN and RBFN...');

load('training_data.mat');

X = [Vdc_train, Idc_train]';
Y_boost = D_train_boost';
Y_sepic = D_train_sepic';
Y_qboost = D_train_qboost';

% BPNN (Levenberg-Marquardt)
disp('Training BPNN for Boost...');
net_bp_boost = fitnet([3, 3], 'trainlm');
net_bp_boost.trainParam.showWindow = false;
net_bp_boost = train(net_bp_boost, X, Y_boost);

disp('Training BPNN for SEPIC...');
net_bp_sepic = fitnet([3, 3], 'trainlm');
net_bp_sepic.trainParam.showWindow = false;
net_bp_sepic = train(net_bp_sepic, X, Y_sepic);

disp('Training BPNN for Quadratic Boost...');
net_bp_qboost = fitnet([3, 3], 'trainlm');
net_bp_qboost.trainParam.showWindow = false;
net_bp_qboost = train(net_bp_qboost, X, Y_qboost);

% RBFN
disp('Training RBFN for Boost...');
% newrb(P, T, GOAL, SPREAD, MN, DF)
% To prevent popup windows we capture output or just run it. newrb prints to console.
net_rbf_boost = newrb(X, Y_boost, 1e-5, 1.0, 50, 10);

disp('Training RBFN for SEPIC...');
net_rbf_sepic = newrb(X, Y_sepic, 1e-5, 1.0, 50, 10);

disp('Training RBFN for Quadratic Boost...');
net_rbf_qboost = newrb(X, Y_qboost, 1e-5, 1.0, 50, 10);

save('trained_networks.mat', 'net_bp_boost', 'net_bp_sepic', 'net_bp_qboost', ...
                             'net_rbf_boost', 'net_rbf_sepic', 'net_rbf_qboost');
disp('Networks trained and saved to trained_networks.mat');
