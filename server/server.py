import time
from flask import Flask, jsonify, request, make_response
from flask_cors import cross_origin
from pymongo import MongoClient
from datetime import datetime
from bson import json_util
from flask_cors import CORS

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


@app.route('/gantt/task', methods=['POST'])
@cross_origin()
def create_task():
    task = {
        'taskid': get_next_sequence(db.tasks,"taskid"),
        'text': request.form["text"],
        'start_date': request.form["start_date"],
        'end_date': request.form["end_date"],
        'holder': request.form["holder"],
        'action': request.form["action"],
        'priority': request.form["priority"],
        'progress': request.form["progress"],
        'parent': request.form["parent"],
        'duration': request.form["duration"],
        'done': False
    }

    print(task, flush=True)
    db.tasks.insert(task)
    return jsonify({"action":"inserted", "taskid":task['taskid']})


@app.route('/gantt', methods=['GET'])
@cross_origin()
def get_tasks():
    tasks = [task for task in db.tasks.find({})]
    return json_util.dumps({'tasks': tasks})


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


def get_next_sequence(collection, name):
    # sequence = collection.find_and_modify(query={'_id': name}, update={'$inc': {'taskid': 1}}, new=True)
    sequence = collection.find_and_modify(update={'$inc': {'taskid': 1}}, new=True)
    print(sequence, flush=True)
    if sequence is None:
        return 1
    return sequence.get('taskid')


if __name__ == '__main__':
    # only used locally
    app.run(host='0.0.0.0', port=8080, debug=True)