import time
from flask import Flask, jsonify
from flask_cors import cross_origin
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
client = MongoClient('mongo', 27017)
db = client.db
#app.config['MONGODB_NAME'] = 'gantt_tasks'
#app.config['MONGO_URI'] = 'mongodb://localhost:27017/gantt_tasks'

#mongo = PyMongo(app)

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


if __name__ == '__main__':
	# only used locally
	app.run(host='0.0.0.0', port=8080, debug=True)