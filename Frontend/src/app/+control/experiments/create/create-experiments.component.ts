import {OnInit, Component} from "@angular/core";
import {NotificationsService} from "angular2-notifications";
import {Router} from "@angular/router";
import {LayoutService} from "../../../shared/modules/helper/layout.service";
import {OEDAApiService, Experiment, Target, ExecutionStrategy} from "../../../shared/modules/api/oeda-api.service";
import * as _ from "lodash.clonedeep";
import {UUID} from "angular2-uuid";
import {isNullOrUndefined} from "util";
import {TempStorageService} from "../../../shared/modules/helper/temp-storage-service";


@Component({
  selector: 'control-experiments',
  templateUrl: './create-experiments.component.html',
})
export class CreateExperimentsComponent implements OnInit {
  experiment: Experiment;
  originalExperiment: Experiment;
  availableTargetSystems: any;
  targetSystem: any;
  executionStrategy: any;
  variable: any;
  initialVariables: any;
  selectedTargetSystem: any;
  stages_count: any;
  is_collapsed: boolean;

  constructor(private layout: LayoutService, private api: OEDAApiService,
              private router: Router, private notify: NotificationsService,
              private temp_storage: TempStorageService) {
    this.availableTargetSystems = [];
    this.initialVariables = [];

    this.targetSystem = this.createTargetSystem();
    // create an empty experiment and execution strategy
    this.executionStrategy = this.createExecutionStrategy();
    this.experiment = this.createExperiment();
    this.originalExperiment = _(this.experiment);
    this.stages_count = null;
    this.is_collapsed = true;
  }

  ngOnInit(): void {
    const ctrl = this;
    ctrl.layout.setHeader("Create an Experiment", "");
    ctrl.api.loadAllTargets().subscribe(
      (data) => {
        if (!isNullOrUndefined(data)) {
          for (var k = 0; k < data.length; k++) {
            if (data[k]["status"] === "READY") {
              ctrl.availableTargetSystems.push(data[k]);
            }
          }
        } else {
          this.notify.error("Error", "Please create target system first");
        }
      }
    );
  }

  navigateToTargetSystemPage() {
    this.router.navigate(["control/targets/create"]).then(() => {
      console.log("navigated to target system creation page");
    });
  }

  firstDropDownChanged(targetSystemName: any) {
    this.selectedTargetSystem = this.availableTargetSystems.find(item => item.name === targetSystemName);

    if (this.selectedTargetSystem !== undefined) {
      if (this.selectedTargetSystem.changeableVariable.length === 0) {
        this.notify.error("Error", "Target does not contain a changeable variable.");
        return;
      }

      // remove previously added variables if they exist
      if (this.experiment.changeableVariable.length > 0) {
        this.experiment.changeableVariable = this.experiment.changeableVariable.splice();
      }

      if (this.experiment.name != null) {
        this.experiment.name = "";
      }

      // also refresh variable model if anything is left from previous state
      if (this.variable != null) {
        this.variable = null;
      }

      // now copy all changeable variables to initialVariables array
      this.initialVariables = this.selectedTargetSystem.changeableVariable.slice(0);

      this.targetSystem = this.selectedTargetSystem;

      // relate target system with experiment now
      this.experiment.targetSystemId = this.selectedTargetSystem.id;

    } else {
      this.notify.error("Error", "Cannot fetch selected target system, please try again");
      return;
    }
  }

  addChangeableVariable(variable) {
    const ctrl = this;
    if (!isNullOrUndefined(variable)) {
      if (ctrl.experiment.changeableVariable.some(item => item.name === variable.name) ) {
        ctrl.notify.error("Error", "This variable is already added");
      } else {
        ctrl.experiment.changeableVariable.push(_(variable));
        this.preCalculateStepSize();
        this.calculateTotalNrOfStages();
      }
    }
  }

  addAllChangeableVariables() {
    const ctrl = this;
    for (var i = 0; i < ctrl.targetSystem.changeableVariable.length; i++) {
      if (ctrl.experiment.changeableVariable.filter(item => item.name === ctrl.targetSystem.changeableVariable[i].name).length === 0) {
        /* vendor does not contain the element we're looking for */
        ctrl.experiment.changeableVariable.push(_(ctrl.targetSystem.changeableVariable[i]));
      }
    }
    this.preCalculateStepSize();
    this.calculateTotalNrOfStages();
  }

  // re-calculates number of stages after each change to step size
  stepSizeChanged(stepSize) {
    if (!isNullOrUndefined(stepSize)) {
      this.calculateTotalNrOfStages();
    }
  }

  // if one of min and max is not valid, sets stages_count to null, so that it will get hidden
  minMaxModelsChanged(value) {
    if (isNullOrUndefined(value)) {
      this.stages_count = null;
    } else {
      this.calculateTotalNrOfStages();
    }
  }

  // if user selects step strategy at any moment of experiment creation, it
  executionStrategyModelChanged(execution_strategy_key) {
    this.experiment.executionStrategy.type = execution_strategy_key;
    if (execution_strategy_key === 'step_explorer') {
      this.preCalculateStepSize();
      this.calculateTotalNrOfStages();
    }
  }

  // pre-determines step size of all added variables if selected execution strategy is step_explorer
  preCalculateStepSize() {
    if (this.experiment.executionStrategy.type === 'step_explorer') {
      for (var j = 0; j < this.experiment["changeableVariable"].length; j++) {
        if (!this.experiment["changeableVariable"][j]["step"]) {
          this.experiment["changeableVariable"][j]["step"] =
            (this.experiment["changeableVariable"][j]["max"] - this.experiment["changeableVariable"][j]["min"]) / 10;
        }
      }
    }
  }

  // returns number of stages using min, max, step size if the selected strategy is step_explorer
  calculateTotalNrOfStages() {
    this.stages_count = null;
    if (this.experiment.executionStrategy.type === 'step_explorer') {
      const stage_counts = [];
      for (var j = 0; j < this.experiment.changeableVariable.length; j++) {
        if (this.experiment.changeableVariable[j]["step"] <= 0) {
          this.stages_count = null;
          break;
        } else {
          if (this.experiment.changeableVariable[j]["step"] > this.experiment.changeableVariable[j]["max"] - this.experiment.changeableVariable[j]["min"]) {
            stage_counts.push(1);
          } else {
            const stage_count = Math.floor((this.experiment.changeableVariable[j]["max"]
              - this.experiment.changeableVariable[j]["min"]) /
              this.experiment.changeableVariable[j]["step"]) + 1;
            stage_counts.push(stage_count);
          }

        }
      }
      if (stage_counts.length !== 0) {
        const sum = stage_counts.reduce(function(a, b) {return a * b; } );
        this.stages_count = sum;
      }
    }

  }

  removeChangeableVariable(index) {
    this.experiment.changeableVariable.splice(index, 1);
    this.calculateTotalNrOfStages();
  }

  removeAllVariables() {
    this.experiment.changeableVariable.splice(0);
    this.calculateTotalNrOfStages();
  }

  hasChanges(): boolean {
    return JSON.stringify(this.experiment) !== JSON.stringify(this.originalExperiment);
  }

  saveExperiment() {
    if (!this.hasErrors()) {
      const all_knobs = [];
      for (var j = 0; j < this.experiment.changeableVariable.length; j++) {
        const knob = [];
        knob.push(this.experiment.changeableVariable[j].name);
        knob.push(Number(this.experiment.changeableVariable[j].min));
        knob.push(Number(this.experiment.changeableVariable[j].max));
        if (this.experiment.executionStrategy.type === "step_explorer") {
          knob.push(Number(this.experiment.changeableVariable[j].step));
        }
        all_knobs.push(knob);
      }
      this.experiment.executionStrategy.knobs = all_knobs;

      this.experiment.executionStrategy.sample_size = Number(this.experiment.executionStrategy.sample_size);
      // save experiment stage to executionStrategy, so that it can be used in determining nr of remaining stages and estimated time
      this.experiment.executionStrategy.stages_count = Number(this.stages_count);

      if (this.experiment.executionStrategy.type === "random") {
        this.experiment.executionStrategy.optimizer_iterations = Number(this.experiment.executionStrategy.optimizer_iterations);
        this.experiment.executionStrategy.optimizer_random_starts = Number(this.experiment.executionStrategy.optimizer_random_starts);
      }

      // now take the incoming data type labeled as "optimize"
      for (var item of this.targetSystem.incomingDataTypes) {
        if (item.is_optimized === true) {
          this.experiment.variables_to_be_optimized = item.name;
          break;
        }
      }
      console.log(this.experiment);
      this.api.saveExperiment(this.experiment).subscribe(
        (success) => {
          this.notify.success("Success", "Experiment saved");
          this.temp_storage.setNewValue(this.experiment);
          this.router.navigate(["control/experiments"]);
        }, (error) => {
          this.notify.error("Error", error.toString());
        }
      )
    }
  }

  // called for every div that's bounded to *ngIf=!hasErrors() expression.
  hasErrors(): boolean {
    const cond1 = this.targetSystem.status === "WORKING";
    const cond2 = this.targetSystem.status === "ERROR";

    const cond3 = this.experiment.changeableVariable == null;
    const cond4 = this.experiment.changeableVariable.length === 0;

    const cond5 = this.experiment.name === null;
    const cond6 = this.experiment.name.length === 0;

    var cond7 = false;
    var cond8 =  false;
    var cond9 = false;
    var cond10 = false;
    if (this.experiment.executionStrategy.type.length === 0) {
      cond7 = true;
    } else {
      if (this.experiment.executionStrategy.type === "step_explorer") {
        for (var j = 0; j < this.experiment.changeableVariable.length; j++) {
          if (this.experiment.changeableVariable[j]["step"] <= 0) {
            cond8 = true;
            break;
          }
        }
      }
      if (this.experiment.executionStrategy.type === "random") {
        if (this.experiment.executionStrategy.optimizer_iterations === null || this.experiment.executionStrategy.optimizer_random_starts === null) {
          cond9 = true;
        }
      }
      if (this.experiment.executionStrategy.type === "self_optimizer") {
        if (this.experiment.executionStrategy.optimizer_method === null || this.experiment.executionStrategy.optimizer_method.length === 0) {
          cond10 = true;
        }
      }
    }

    // check data types to be optimized
    var cond11 = false;
    let nr_of_incoming_data_types_to_be_optimized = 0;
    for (var item of this.targetSystem.incomingDataTypes) {
      if (item.is_optimized) {
        nr_of_incoming_data_types_to_be_optimized += 1;
      }
    }
    if (nr_of_incoming_data_types_to_be_optimized != 1) {
      cond11 = true;
    }

    return cond1 || cond2 || cond3 || cond4 || cond5 || cond6 || cond7 || cond8 || cond9 || cond10 || cond11;
  }

  createExperiment(): Experiment {
    return {
      "id": UUID.UUID(),
      "name": "",
      "description": "",
      "status": "",
      "targetSystemId": "",
      "executionStrategy": this.executionStrategy,
      "changeableVariable": [],
      "variables_to_be_optimized": "" // TODO: this will be converted into array
    }
  }

  createTargetSystem(): Target {
    return {
      "id": "",
      "dataProviders": [],
      "primaryDataProvider": {
        "type": "",
        "ignore_first_n_samples": null
      },
      "secondaryDataProviders": [],
      "changeProvider": {
        "type": "",
      },
      "name": "",
      "status": "",
      "description": "",
      "incomingDataTypes": [],
      "changeableVariable": []
    }
  }

  createExecutionStrategy(): ExecutionStrategy {
    return {
      type: "",
      sample_size: 40,
      knobs: [],
      stages_count: 0,
      optimizer_method: "",
      optimizer_iterations: 10,
      optimizer_random_starts: 5
    }
  }

}
