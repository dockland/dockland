const path = require('path');
const low = require('lowdb'),
  FileSync = require('lowdb/adapters/FileSync');
const yaml = require('js-yaml');

const dbPath = path.join(require('./config').docker.root, 'db.yml');
const db = low(
  new FileSync(dbPath, {
    defaultValue: {},
    serialize: array => yaml.safeDump(array),
    deserialize: string => yaml.safeLoad(string)
  })
);
db._.mixin(require('lodash-id'));
db._.id = 'name';
db.defaults({ projects: [] }).write();

const projects = db.get('projects');

/**
  @typedef Project
  @type {object}
  @property {string} name - project name, usually Github repo name
  @property {Instance[]} instances - registered instances for this project
 */

/**
  @typedef Instance
  @type {object}
  @property {string} name - instance name, usually a Github PR id
  @property {string} image - deployed docker image
  @property {string} domain - proxied domain name
  @property {string} src - docker-compose.yml location
 */

/**
 * Find all registered projects, matching the given criteria.
 * Without criteria (null, undefined, {}), all projects are returned
 * @param {object} [criteria] map of key, values criteria to filter registered projects
 * @return {Project[]}
 */
module.exports.findProjects = criteria => projects.filter(criteria).cloneDeep().value();

module.exports.getProject = projectName => projects.getById(projectName).cloneDeep().value();
module.exports.getProjectInstance = (projectName, instanceName) => projects.getById(projectName).get('instances').getById(instanceName).cloneDeep().value();

/**
 * Register or update an existing project
 * @param {Project} project
 */
module.exports.upsertProject = project =>
  projects
    .upsert(
      Object.assign({ instances: [] }, projects.getById(project.name).value(), project)
    )
    .write();

module.exports.deleteInstance = (projectName, instanceName) =>
  projects.getById(projectName).get('instances').removeById(instanceName).write();

/**
 * Register or update an existing instance in a project
 * @param {string} projectName
 * @param {Instance} instance
 */
module.exports.addInstance = (projectName, instance) =>
  projects.getById(projectName).get('instances').upsert(instance).write();
