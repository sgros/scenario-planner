import time
from flask import Flask, jsonify, request, make_response
from flask_cors import cross_origin
from pymongo import MongoClient
from bson import json_util
from flask_cors import CORS
from datetime import datetime
import random

app = Flask(__name__)
client = MongoClient('mongo', 27017)
db = client.db
CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'


#region API


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


@app.route('/gantt/plan', methods=['GET'])
@cross_origin()
def get_plan():
    result = plan_gantt_actions()
    return jsonify({'success': result})


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
        'preconditions': request.form["preconditions"],
        'effects': request.form["effects"],
        'done': False
    }

    db.tasks.insert(task)
    return jsonify({"action": "inserted", "tid": "taskId"})


@app.route('/gantt', methods=['GET'])
@cross_origin()
def get_tasks():
    mongo_tasks = [task for task in db.tasks.find({})]
    tasks = []

    for mongo_task in mongo_tasks:
        task = {
            'id': int(mongo_task['taskid']),
            'text': mongo_task['text'],
            'start_date':mongo_task['start_date'],
            'end_date':mongo_task['end_date'],
            'holder': mongo_task['holder'],
            'action': mongo_task['action'],
            'priority': mongo_task['priority'],
            'progress': mongo_task['progress'],
            'duration': mongo_task['duration'],
            'parent': mongo_task['parent'],
            'success_rate': mongo_task['success_rate'],
            'preconditions': mongo_task['preconditions'],
            'effects': mongo_task['effects'],
            'done': mongo_task['done']
        }
        tasks.append(task)

    mongo_links = [link for link in db.links.find({})]
    links = []

    for mongo_link in mongo_links:
        link = {
            'id': int(mongo_link['link_id']),
            'source': mongo_link['source'],
            'target': mongo_link['target'],
            'type': str(mongo_link['type'])
        }
        links.append(link)

    return json_util.dumps({'data': tasks, 'links': links})


@app.route('/gantt/task/<taskId>', methods=['PUT'])
@cross_origin()
def update_task(taskId):
    query = {"taskid": int(float(taskId))}
    values = {"$set": {
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
        'preconditions': request.form["preconditions"],
        'effects': request.form["effects"],
    }}

    print(query, flush=True)
    print(values, flush=True)
    db.tasks.find_one_and_update(query, values)
    return jsonify({"action": "updated"})


@app.route('/gantt/task/<taskId>', methods=['DELETE'])
@cross_origin()
def delete_task(taskId):
    query = {"taskid": int(float(taskId))}
    db.tasks.delete_one(query)
    return jsonify({"action": "deleted"})


@app.route('/gantt/link', methods=['POST'])
@cross_origin()
def add_link():
    link = {
        "link_id": get_next_sequence("linkId"),
        "source": int(float(request.form['source'])),
        "target": int(float(request.form['target'])),
        "type": str(int(request.form['type']))
    }
    db.links.insert(link)
    return jsonify({"action": "inserted", "tid": "linkId"})


@app.route('/gantt/link/<linkId>', methods=['PUT'])
@cross_origin()
def update_link(linkId):
    query = {"link_id": int(linkId)}
    values = {"$set": {
        "source": int(float(request.form['source'])),
        "target": int(float(request.form['target'])),
        "type": str(int(request.form['type']))
    }}
    db.links.find_one_and_update(query, values)
    return jsonify({"action": "updated"})


@app.route('/gantt/link/<linkId>', methods=['DELETE'])
@cross_origin()
def delete_link(linkId):
    query = {"link_id":int(linkId)}
    db.links.remove(query)
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
#endregion


#region utils

def get_next_sequence(name):
    sequence = db.counters.find_and_modify({"_id": name}, {"$inc":{"sequence_value":1}}, new=True)
    if sequence is None:
        return 0
    return sequence.get('sequence_value')


def parse_conditions(conditions):
    condition_objects = conditions.split("; ")
    conditions = []
    for condition_object in condition_objects:
        if condition_object == '':
            continue
        condition_value = condition_object.split(" = ")
        if len(condition_value) == 0:
            continue
        condition = {
            'name': condition_value[0].strip(),
            'value': condition_value[1].lower() == 'true'
        }
        conditions.append(condition)
    return conditions

def check_if_threat(condition, posteffects):
    is_threat = False
    for posteffect in posteffects:
        if posteffect['name'] == condition['name'] and posteffect['value'] != condition['value']:
            is_threat = True
            break
    return is_threat


def where_contains_effect(actions, condition_name, condition_value):
    valid_actions = []
    for action in actions:
        effects = action['posteffects']
        for effect in effects:
            if effect['name'] == condition_name and effect['value'] == condition_value:
                valid_actions.append(action)
                break
    return valid_actions

#endregion


#region PoP


def plan_gantt_actions():
    causal_links = []
    ordering_constraints = []
    steps = []
    goals = []
    actions = []
    db_actions = db.actions.find()
    for db_action in db_actions:
        action = {
            'action_id': db_action['action_id'],
            'name': db_action['name'],
            'preconditions': parse_conditions(db_action['preconditions']),
            'posteffects': parse_conditions(db_action['posteffect']),
            'time': int(db_action['time'])
        }
        actions.append(action)

    db_initial_state = db.tasks.find_one({'action': "1"})
    initial_step = {
        'step_id': int(db_initial_state['action']),  # initial state action id = 1
        'preconditions': [],
        'posteffects': parse_conditions(db_initial_state['effects'])
    }
    steps.append(initial_step)

    db_goal_state = db.tasks.find_one({'action': "2"})
    goal_conditions = parse_conditions(db_goal_state['preconditions'])
    goal_step = {
        'step_id': int(db_goal_state['action']),  # goal state action id = 2
        'preconditions': goal_conditions,
        'posteffects': []
    }
    steps.append(goal_step)

    for goal_condition in goal_conditions:
        goal_state = {
            'c': goal_condition,
            'S': goal_step
        }
        goals.append(goal_state)

    plan_problem = {
        'steps': steps,
        'ordering_constraints': ordering_constraints,
        'causal_links': causal_links,
        'successful': False
    }

    plan = partial_order_planner(plan_problem, goals, actions)
    db.partial_plans.insert(plan)
    if plan['successful']:
        return construct_gantt_total_order_plan(plan)
    return False


def partial_order_planner(plan_problem, goals, actions):
    # 1. if G is empty terminate and return plan
    if len(goals) == 0:
        plan_problem['successful'] = True
        return plan_problem

    # 2. select {c,S} e G
    current_goal = random.choice(goals)
    current_goal_precondition = current_goal['c']

    # 2.a if there's a link "S[i] -(e, not c)-> S" in causal links L fail -> IMPOSSIBLE PLAN
    causal_links = plan_problem['causal_links']
    contains_contradiction = False
    for link in causal_links:
        if link['target']['step_id'] == current_goal['S']['step_id'] \
                and link['c']['name'] == current_goal_precondition['name'] \
                and link['c']['value'] != current_goal_precondition['value']:
            contains_contradiction = True

    if contains_contradiction:
        plan_problem['successful'] = False
        return plan_problem

    # 3. nondeterministically select step S or action with effect e
    #   if there is no such action fail -> IMPOSSIBLE PLAN
    #   otherwise update planning problem
    valid_actions = where_contains_effect(actions, current_goal_precondition['name'], current_goal_precondition['value'])
    if len(valid_actions) == 0:
        plan_problem['successful'] = False
        return plan_problem

    selected_action = random.choice(valid_actions)

    if selected_action is None:
        plan_problem['successful'] = False
        return plan_problem

    selected_step = next((x for x in plan_problem['steps'] if x['step_id'] == selected_action['action_id']), None)
    if selected_step is None:
        selected_step = {
            'step_id': selected_action['action_id'],
            'preconditions': selected_action['preconditions'],
            'posteffects': selected_action['posteffects']
        }

    plan_problem['steps'].append(selected_step)
    # Update G
    goals.remove(current_goal)
    for precondition in selected_step['preconditions']:
        new_goal = {
            'c': precondition,
            'S': selected_step
        }
        goals.append(new_goal)

    # Update O
    new_order = {
        'predecessor': selected_step,
        'successor': current_goal['S']
    }
    plan_problem['ordering_constraints'].append(new_order)

    # Update L
    new_causal_link = {
        'source': selected_step,
        'c': current_goal_precondition,
        'target': current_goal['S']
    }
    plan_problem['causal_links'].append(new_causal_link)

    # 4. causal link protection (demotion)
    selected_step_posteffects = selected_step['posteffects']
    for causal_link in causal_links:
        condition = causal_link['c']
        is_threat = check_if_threat(condition, selected_step_posteffects)
        if is_threat:
            protection_order = {
                'predecessor': selected_step,
                'successor': causal_link['source']
            }
            plan_problem['ordering_constraints'].append(protection_order)

    # 5. recursively call PoP
    return partial_order_planner(plan_problem, goals, actions)

#endregion


#region Gantt Plan

def construct_gantt_total_order_plan(partial_plan):
    return False


#endregion


if __name__ == '__main__':
    # only used locally
    app.run(host='0.0.0.0', port=8080, debug=True)