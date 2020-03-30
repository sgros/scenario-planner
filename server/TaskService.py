from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from flask_cors import CORS

#app = Flask(__name__)
#mongo = PyMongo(app)