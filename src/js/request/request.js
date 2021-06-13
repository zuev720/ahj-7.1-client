export default function request(method, queryString, params = null) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://ahj-7-backend.herokuapp.com/');
    const xhr = new XMLHttpRequest();
    xhr.open(method, url + queryString, true);

    if (method === 'GET') {
      xhr.send();
    } else {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(params);
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          if (xhr.responseText) {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          }
        } catch (e) {
          reject(e);
        }
      }
    });
  });
}
