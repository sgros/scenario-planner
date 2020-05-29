import time
from flask import Flask, jsonify, request, make_response
from flask_cors import cross_origin
from pymongo import MongoClient
from bson import json_util
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
client = MongoClient('mongo', 27017)
db = client.db
CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/', methods=['GET'])
@cross_origin()
def root():
    db.hits.insert_one({ 'time': datetime.utcnow() })
    message = 'This page has been visited {} times.'.format(db.hits.count())
    return jsonify({ 'message': message })


@app.route('/time')
@cross_origin()
def get_current_time():
    return jsonify({ 'time': time.time() })


# @app.route('/actions', methods=['POST'])
# @cross_origin()
# def import_actions():


# @app.route('/gantt/plan', methods=['GET'])
# @cross_origin()
# def get_plan():
# tbd:
#     - get initial state and goal
#     - call planning algorithm
#         - constructs gantt diagram with correct actions and links
#     - return success or failure


@app.route('/gantt/task', methods=['POST'])
@cross_origin()
def create_task():
    task = {
        'taskid': get_next_sequence("taskId"),
        'text': request.form["text"],
        'start_date': request.form["start_date"],
        'end_date': request.form["end_date"],
        'holder': request.form["holder"],
        'action': request.form["action"],
        'priority': request.form["priority"],
        'progress': float(request.form["progress"]),
        'parent': request.form["parent"],
        'duration': int(request.form["duration"]),
        'success_rate': request.form["success_rate"],
        'done': False
    }

    db.tasks.insert(task)
    return jsonify({"action":"inserted", "taskid":task['taskid']})


@app.route('/gantt', methods=['GET'])
@cross_origin()
def get_tasks():
    mongo_tasks = [task for task in db.tasks.find({})]
    tasks = []

    for mongo_task in mongo_tasks:
        task = {
            'id': str(mongo_task['taskid']),
            'text': mongo_task['text'],
            'start_date':mongo_task['start_date'],
            'end_date':mongo_task['end_date'],
            'holder': mongo_task['holder'],
            'action': mongo_task['action'],
            'priority': mongo_task['priority'],
            #'progress': float(mongo_task['progress']),
            #'duration':int(mongo_task['duration']),
            #'parent': mongo_task['parent'],
            #'success_rate': mongo_task['success_rate'],
            #'done': mongo_task['done']
        }
        print(task, flush=True)
        tasks.append(task)


    lnks = [
        {"id":"1", "source":"2", "target":"3", "type":"0"}
    ]

    return json_util.dumps({'data': tasks, 'links':lnks})


@app.route('/gantt/task/<taskId>', methods=['PUT'])
@cross_origin()
def update_task(taskId):
    return jsonify({"action":"updated"})


@app.route('/gantt/task/<taskId>', methods=['DELETE'])
@cross_origin()
def delete_task(taskId):
    return jsonify({"action":"deleted"})


@app.route('/gantt/link', methods=['POST'])
@cross_origin()
def add_link():
    return jsonify({"action": "inserted", "tid": "linkId"})


@app.route('/gantt/link/<linkId>', methods=['PUT'])
@cross_origin()
def update_link(linkId):
    return jsonify({"action": "updated"})


@app.route('/gantt/link/<linkId>', methods=['DELETE'])
@cross_origin()
def delete_link(linkId):
    return jsonify({"action": "deleted"})


@app.route('/actions/import', methods=['POST'])
@cross_origin()
def import_actions():
    data = request.get_json()
    action_data = data['data']
    loaded_actions = action_data['actions']

    # if the collection is empty (or does not exist) first insert initial state action and goal state action
    if "actions" not in db.list_collection_names() or db.actions.count() == 0:
        initial_state = {
            "action_id": get_next_sequence("actionId"),
            "name": "Initial state",
            "preconditions": "",
            "posteffect": "",
            "time": 0,
            "price": 0
        }
        db.actions.insert(initial_state)
        goal_state = {
            "action_id": get_next_sequence("actionId"),
            "name": "Goal state",
            "preconditions": "",
            "posteffect": "",
            "time": 0,
            "price": 0
        }
        db.actions.insert(goal_state)

    for (action, properties) in loaded_actions.items():
        action_data = {
            "action_id": get_next_sequence("actionId"),
            "name": action,
            "preconditions": properties['preconditions'],
            "posteffect": properties['posteffects'],
            "time": properties['time'],
            "price": properties['price']
        }
        db.actions.insert(action_data)
    return jsonify({"action": "import"})


@app.route('/actions', methods=['GET'])
@cross_origin()
def get_actions():
    actions = []
    actions_data = db.actions.find()
    for action_data in actions_data:
        action = {
            "key": action_data["action_id"],
            "label": action_data["name"]
        }
        actions.append(action)
    return jsonify({"actions": actions})

def get_next_sequence(name):
    sequence = db.counters.find_and_modify({"_id": name}, {"$inc":{"sequence_value":1}}, new=True)
    if sequence is None:
        return 0
    return sequence.get('sequence_value')


# def plan_gantt_actions(initialState, goalState):
# implement planning algorithm
# construct gantt diagram (in mongo)
# return success or failure


if __name__ == '__main__':
    # only used locally
    app.run(host='0.0.0.0', port=8080, debug=True)