import time
from flask import Flask, jsonify, request, make_response
from flask_cors import cross_origin
from pymongo import MongoClient
from datetime import datetime
from bson import json_util
from flask_cors import CORS
import logging

app = Flask(__name__)
client = MongoClient('mongo', 27017)
db = client.db
CORS(app)
#app.config['MONGODB_NAME'] = 'gantt_tasks'
#app.config['MONGO_URI'] = 'mongodb://localhost:27017/gantt_tasks'

#mongo = PyMongo(app)

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
    # task = {
    #     'taskid': 2,#getNextSequence(db.tasks,"taskid"),
    #     'text': request.json['text'],
    #     'start_date': request.json['start_date'],
    #     'end_date': request.json['end_date'],
    #     'holder': request.json['holder'],
    #     'action': request.json['action'],
    #     'priority': request.json['priority'],
    #     'done': False
    # }
    # db.tasks.insert(task)
    return jsonify({"action":"inserted", "tid":2})


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



def getNextSequence(collection,name):
   sequence = collection.find_and_modify(query={'_id': name}, update={'$inc': {'seq': 1}}, new=True)

   if (sequence == None):
       return 2
   return sequence.get('seq');


if __name__ == '__main__':
	# only used locally
	app.run(host='0.0.0.0', port=8080, debug=True)