require([
    'jquery',
    'underscore',
    'knockout',
    'views/page-view',
    'views/graph-manager/graph',
    'views/graph-manager/branch-list',
    'views/graph-manager/node-list',
    'views/graph-manager/permissions-list',
    'views/graph-manager/node-form',
    'views/graph-manager/permissions-form',
    'views/graph-manager/branch-info',
    'models/node',
    'models/graph',
    'graph-manager-data'
], function($, _, ko, PageView, GraphView, BranchListView, NodeListView, PermissionsListView, NodeFormView, PermissionsFormView, BranchInfoView, NodeModel, GraphModel, data) {
    var prepGraph = function(graph) {
        graph.nodes.forEach(function(node) {
            node.cardinality = 'n';
            if (node.nodeid === node.nodegroup_id) {
                var group = _.find(graph.nodegroups, function(nodegroup) {
                    return nodegroup.nodegroupid === node.nodeid;
                });
                node.cardinality = group.cardinality;
            }
        })
    };

    data.branches.forEach(function(branch){
        branch.selected = ko.observable(false);
        branch.filtered = ko.observable(false);
        prepGraph(branch.graph);
    }, this);

    prepGraph(data.graph);

    var graphModel = new GraphModel({
        data: data.graph,
        datatypes: data.datatypes
    });

    graphModel.on('changed', function(model, options){
        viewModel.graphView.redraw(true);
    });
    graphModel.on('select-node', function(model, options){
        viewModel.nodeForm.closeClicked(true);
    });

    var loading = ko.observable(false);
    var viewModel = {
        graphModel: graphModel,
        loading: loading
    };

    viewModel.graphView = new GraphView({
        el: $('#graph'),
        graphModel: graphModel
    });

    viewModel.branchListView= new BranchListView({
        el: $('#branch-library'),
        branches: ko.observableArray(data.branches),
        graphModel: graphModel,
        loading: loading
    });

    viewModel.nodeForm = new NodeFormView({
        el: $('#nodeCrud'),
        graphModel: graphModel,
        validations: data.validations,
        branchListView: viewModel.branchListView,
        loading: loading
    });

    viewModel.nodeList = new NodeListView({
        el: $('#node-listing'),
        graphModel: graphModel
    });

    viewModel.permissionsList = new PermissionsListView({
        el: $('#node-permissions')
    });

    viewModel.permissionsForm = new PermissionsFormView({
        el: $('#permissions-panel')
    });

    new PageView({
        viewModel: viewModel
    });

    var resize = function(){
        $('#graph').height($(window).height()-200);
        $('.tab-content').height($(window).height()-259);
        $('.grid-container').height($(window).height()-360);
        viewModel.graphView.resize();
    }

    $( window ).resize(resize);

    resize();
});
