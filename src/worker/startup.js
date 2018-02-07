const { dockerComposeUp } = require('./_dockerutils');

const log = require('../log');
const proxy = require('../proxy');
const storage = require('../storage');

const startInstance = (projectName, { name, domain, src, image }) =>
  dockerComposeUp({
    cwd: src,
    projectName: `${projectName}-${name}`
  }).then(() => proxy.watch(domain, image));

module.exports = () => {
  const projects = storage.findProjects();
  
  if (projects.length === 0) return;
  
  const promises = projects.reduce(
    (promises, project) =>
      promises.concat(
        project.instances.map(instance =>
          startInstance(project.name, instance).catch(e => ({
            project: project.name,
            instance: instance.name,
            error: e
          }))
        )
      ),
    []
  );

  const count = promises.length;
  log(`Bringing back ${count} instance${count > 1 ? 's' : ''} to life...`);

  Promise.all(promises).then(status => {
    const failures = status.filter(s => !!s);
    const count = failures.length;

    if (failures.length > 0) {
      log(`${count} instance${count > 1 ? 's' : ''} could not be revived : `);
      failures.forEach(f => log(`\t${f.project} - ${f.instance} : ${f.error}`));
    } else log('All instances are back alive !');
  });
};
