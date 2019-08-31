

let recaptchaFlow = function (lib) {
  const {
    ConsoleAction, FetchRequest, AbstractFlow, NavigationAction, config: libConfig
  } = lib;
  let flow = AbstractFlow('recaptcha-flow');


  const { url, cfg } = getVars();
  let simpleParams = { url, message: 'recaptcha test' };

  // chain of commands
  // prettier-ignore
  flow
    .createChain = () => [
      new ConsoleAction('clear console'      ,  flow,  [], 'clear'),
      new FetchRequest('fetch request',         flow,  [],   url, cfg),
      // new NavigationAction('open in web-view',  flow,  [],   'WebviewScreen', {simpleParams})
  ];

  return flow;
}

function getVars() {
  return {
    // url: 'https://beta.locktrip.com/api/hotels/search?query=sofia',
    url: 'https://staging.locktrip.com/api/hotels/search?query=sofia',
    // url: 'https://dev.locktrip.com/api/hotels/search?query=sofia',
    cfg: getConfig('GET')
  }
}

function getConfig(method, data) {
  let result = {
    method,
    headers: new Headers({
      'Content-Type': 'application/json'
    })

  }

  switch (method) {
    case 'POST':
      result.body = JSON.stringify(data);
      break;

    case 'GET':
      break;
  }

  return result;
}


export default recaptchaFlow;