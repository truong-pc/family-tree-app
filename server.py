from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from flask_cors import CORS
from neo4j import GraphDatabase

# Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Needed for flashing messages
CORS(app)

# Neo4j database connection
class FamilyTreeDB:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def create_person(self, name, gender, desc):
        with self.driver.session() as session:
            session.run("CREATE (p:Person {name: $name, gender: $gender, desc: $desc})", name=name, gender=gender, desc=desc)

    def create_relationship(self, parent_name, child_name):
        with self.driver.session() as session:
            session.run("""
                MATCH (p:Person {name: $parent_name}), (c:Person {name: $child_name})
                CREATE (p)-[:PARENT_OF]->(c)
            """, parent_name=parent_name, child_name=child_name)

    def person_exists(self, name):
        with self.driver.session() as session:
            result = session.run("MATCH (p:Person {name: $name}) RETURN p", name=name)
            return result.single() is not None

    def get_all_people(self):
        with self.driver.session() as session:
            result = session.run("MATCH (p:Person) RETURN p.name AS name, p.gender AS gender, p.desc AS desc")
            return [{"name": record["name"], "gender": record["gender"], "desc": record.get("desc", "")} for record in result]

    def get_people_without_relationships(self):
        with self.driver.session() as session:
            result = session.run("""
                MATCH (p:Person)
                WHERE NOT (p)-[:PARENT_OF]->() AND NOT ()-[:PARENT_OF]->(p)
                RETURN p.name AS name, p.gender AS gender, p.desc AS desc
            """)
            return [{"name": record["name"], "gender": record["gender"], "desc": record.get("desc", "")} for record in result]

    def get_family_tree(self):
        with self.driver.session() as session:
            result = session.run("""
                MATCH (p:Person)-[:PARENT_OF]->(c:Person)
                RETURN p.name AS parent, c.name AS child
            """)
            return [(record["parent"], record["child"]) for record in result]

    def delete_person(self, name):
        with self.driver.session() as session:
            session.run("MATCH (p:Person {name: $name}) DETACH DELETE p", name=name)

    def search_person(self, name):
        with self.driver.session() as session:
            result = session.run("""
                MATCH (p:Person)
                WHERE toLower(p.name) CONTAINS toLower($name)
                RETURN p.name AS name, p.gender AS gender, p.desc AS desc
            """, name=name)
            return [{"name": record["name"], "gender": record["gender"], "desc": record.get("desc", "")} for record in result]

# Connect to the Neo4j database
db = FamilyTreeDB("neo4j+s://36a07ff3.databases.neo4j.io", "neo4j", "yAQbSfHQud9EMJSK6Kb4dAIpNtzAPxsWqi5pxd-eBqI")

# Routes
@app.route("/")
def index():
    people = db.get_all_people()
    people_without_relationships = db.get_people_without_relationships()
    return render_template("index2.html", people=people, people_without_relationships=people_without_relationships)

@app.route("/add_person", methods=["POST"])
def add_person():
    if request.is_json:
        data = request.get_json()
        name = data.get("name")
        gender = data.get("gender")
        desc = data.get("description")
    else:
        name = request.form.get("name")
        gender = request.form.get("gender")
        desc = request.form.get("description")
    if not name or not gender:
        return jsonify({"error": "Name and gender are required"}), 400
    db.create_person(name, gender, desc)
    return jsonify({"status": "success"})

@app.route("/add_child", methods=["POST"])
def add_child():
    data = request.get_json()
    parent = data.get("parent")
    child = data.get("child")
    gender = data.get("gender")
    desc = data.get("desc")
    if not db.person_exists(parent):
        return jsonify({"error": f"Parent '{parent}' does not exist."}), 400
    if not db.person_exists(child):
        db.create_person(child, gender, desc)
    db.create_relationship(parent, child)
    return jsonify({"status": "success"})

@app.route("/add_relationship", methods=["POST"])
def add_relationship():
    if request.is_json:
        data = request.get_json()
        parent = data.get("parent")
        child = data.get("child")
    else:
        parent = request.form.get("parent")
        child = request.form.get("child")
    if not parent or not child:
        return jsonify({"error": "Parent and child are required"}), 400
    db.create_relationship(parent, child)
    return jsonify({"status": "success"})

@app.route("/delete_person/<name>", methods=["DELETE"])
def delete_person(name):
    if not db.person_exists(name):
        return jsonify({"error": f"Person '{name}' does not exist."}), 404
    db.delete_person(name)
    return jsonify({"status": "success"})

def generate_family_tree_data():
    relationships = db.get_family_tree()
    people = db.get_all_people()
    nodes = [{"id": person["name"], "gender": person["gender"], "desc": person["desc"]} for person in people]
    links = [{"source": parent, "target": child} for parent, child in relationships]
    return {"nodes": nodes, "links": links}

@app.route("/get_family_tree")
def get_family_tree():
    family_tree_data = generate_family_tree_data()
    return jsonify(family_tree_data)

@app.route("/search_person", methods=["GET"])
def search_person():
    search_term = request.args.get("name", "")
    results = db.search_person(search_term)
    return jsonify({"results": results})

if __name__ == "__main__":
    app.run(debug=True)