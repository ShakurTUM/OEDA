from flask import jsonify
from flask_restful import Resource
from oeda.config.crowdnav_config import Config as CrowdNavConfig
from oeda.config.platooning_config import Config as PlatooningConfig
from oeda.config.R_config import Config as mlrMBOConfig
from oeda.log import *
import traceback
import json
import requests

class ConfigController(Resource):
    @staticmethod
    def get():
        try:
            crowd_nav_knobs = json.loads(open('oeda/config/crowdnav_config/knobs.json').read())
            crowd_nav_data_providers = json.loads(open('oeda/config/crowdnav_config/dataProviders.json').read())

            black_box_knobs = json.loads(open('oeda/config/black_box_config/knobs.json').read())
            black_box_data_providers = json.loads(open('oeda/config/black_box_config/dataProviders.json').read())

            platooning_knobs = json.loads(open('oeda/config/platooning_config/knobs.json').read())
            platooning_data_providers = json.loads(open('oeda/config/platooning_config/dataProviders.json').read())

            data = [
                {
                    "name": "CrowdNav",
                    "description": "Simulation based on SUMO",
                    "kafkaTopicRouting": CrowdNavConfig.kafkaTopicRouting,
                    "kafkaTopicTrips": CrowdNavConfig.kafkaTopicTrips,
                    "kafkaTopicPerformance": CrowdNavConfig.kafkaTopicPerformance,
                    "kafkaHost": CrowdNavConfig.kafkaHost,
                    "kafkaCommandsTopic": CrowdNavConfig.kafkaCommandsTopic, # for now, kafkaHost and kafkaCommandsTopic are only fetched & used for populating change provider entity in OEDA
                    "changesApplicable": True, # if we can change target system's default configuration on-the-fly
                    "knobs": crowd_nav_knobs, # used to populate changeableVariables in OEDA
                    "dataProviders": crowd_nav_data_providers # used to populate dataProviders in OEDA
                },
                {
                    "name": "Platooning",
                    "description": "Car Platooning Simulation based on SUMO",
                    "kafkaTopicCarData": PlatooningConfig.kafkaTopicCarData,
                    # "kafkaTopicPlatooningData": PlatooningConfig.kafkaTopicPlatooningData,
                    "kafkaHost": PlatooningConfig.kafkaHost,
                    "kafkaCommandsTopic": PlatooningConfig.kafkaPlatooningCommandsTopic, # for now, kafkaHost and kafkaCommandsTopic are only fetched & used for populating change provider entity in OEDA
                    "changesApplicable": True, # if we can change target system's default configuration on-the-fly
                    "knobs": platooning_knobs, # used to populate changeableVariables in OEDA
                    "dataProviders": platooning_data_providers # used to populate dataProviders in OEDA
                },
                {
                    "name": "Black-box function",
                    "description": "Three-hump camel function with randomness",
                    "changesApplicable": True, # yes, we can change internal x & y values of black-box fcn (although it won't effect the last result)
                    "url": "http://localhost:3003",
                    "knobs": black_box_knobs,
                    "dataProviders": black_box_data_providers
                }
            ]
            resp = jsonify(data)
            resp.status_code = 200
            return resp

        except Exception as e:
            tb = traceback.format_exc()
            print(tb)
            return {"error": e.message}, 404

class MlrMBOConfigController(Resource):
    @staticmethod
    def get():
        try:
            host_with_port = "http://" + str(mlrMBOConfig.plumber_host) + ":" + str(mlrMBOConfig.plumber_port)
            connection_err_msg = {"error": "Connection with mlrMBO-API is failed"}
            try:
                r = requests.get(host_with_port)
                if r:
                    resp = jsonify({"message": "mlrMBO-API works fine"})
                    resp.status_code = 200
                    return resp
                else:
                    return connection_err_msg, 404
            except requests.ConnectionError as e:
                error(connection_err_msg)
                return connection_err_msg, 404

        except Exception as e:
            tb = traceback.format_exc()
            print(tb)
            return {"error": e.message}, 404