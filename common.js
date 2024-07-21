// Major Kindle limitation: No anonymous lambdas without the function keyword.

const MIN_HISTORY = 4; // don't report any 10-minute average until we have MIN_HISTORY samples

function sum(total, tuple) {
  return total + tuple[1];
}

function update_moving_average(timestamp, value, history) {
  // Maintain ten minutes of unique values
  // add new
  history.push([timestamp, value]);

  // remove old
  while (history.length > 0 && timestamp - history[0][0] > 600) {
    // ten minutes
    history.shift();
  }

  if (history.length >= MIN_HISTORY) {
    return Math.round(history.reduce(sum, 0) / history.length);
  } else {
    return null;
  }
}

function fetch_data(api_url, data_cb) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", api_url, true);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        data_cb(data);
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);
}

function log(text) {
  const div = document.getElementById("log");
  div.innerHTML += text;
  div.innerHTML += "<br>\n";
}

function update_body(data, div_classname) {
  const div = document.getElementsByClassName(div_classname)[0];
  const lastUpdateDate = new Date(data.response_date * 1000);
  div.getElementsByClassName("lastupdate")[0].innerHTML =
    lastUpdateDate.toLocaleString();
  const temp_node = div.getElementsByClassName("temp")[0];
  temp_node.innerHTML = data.current_temp_f;
  const aqi_node = div.getElementsByClassName("currentaqi")[0];
  aqi_node.innerHTML = data["pm2.5_aqi"];
  const aqi_ave_node = div.getElementsByClassName("10minaqi")[0];
  aqi_ave_node.innerHTML = data["pm2.5_aqi_ave"];

  //  color
  if (Date.now() - lastUpdateDate.getTime() < 1800000) {
    // half an hour
    temp_node.parentElement.style.backgroundColor = mapTempColor(
      data.current_temp_f
    );
    aqi_node.parentElement.style.backgroundColor = mapAQIColor(
      data["pm2.5_aqi"]
    );
    aqi_ave_node.parentElement.style.backgroundColor = mapAQIColor(
      data["pm2.5_aqi"]
    );
  } else {
    // stale
    temp_node.parentElement.style.backgroundColor = "grey";
    aqi_node.parentElement.style.backgroundColor = "grey";
    aqi_ave_node.parentElement.style.backgroundColor = "grey";
  }
}

function timestamp_now() {
  return Math.round(Date.now() / 1000);
}

function mapAQIColor(value) {
  if (value < 15) {
    return "lightgreen";
  } else if (value < 20) {
    return "yellow";
  } else if (value < 30) {
    return "orange";
  } else if (value < 40) {
    return "red";
  } else if (value < 50) {
    return "mediumpurple";
  } else {
    return "saddlebrown";
  }
}

function mapTempColor(value) {
  if (value < 50) {
    return "purple";
  } else if (value < 65) {
    return "lavender";
  } else if (value < 70) {
    return "lightblue";
  } else if (value < 80) {
    return "lightgreen";
  } else if (value < 85) {
    return "yellow";
  } else if (value < 90) {
    return "orange";
  } else if (value < 100) {
    return "red";
  } else {
    return "mediumpurple";
  }
}

function update_outside() {
  fetch_data(
    "http://purpleair-2f5c.localdomain/json?live=true",
    function (data) {
      // Outdoor sensor has two particle counters. Hack it for now.
      data["pm2.5_aqi"] = Math.round(
        (data["pm2.5_aqi"] + data["pm2.5_aqi_b"]) / 2
      );
      data["pm2.5_aqi_ave"] = update_moving_average(
        timestamp_now(),
        data["pm2.5_aqi"],
        outside_aqi_history
      );
      update_body(data, "outside");
    }
  );
}

function update_attic() {
  fetch_data(
    "http://purpleair-9826.localdomain/json?live=true",
    function (data) {
      // Outdoor sensor has two particle counters. Hack it for now.
      data["pm2.5_aqi"] = Math.round(
        (data["pm2.5_aqi"] + data["pm2.5_aqi_b"]) / 2
      );
      data["pm2.5_aqi_ave"] = update_moving_average(
        timestamp_now(),
        data["pm2.5_aqi"],
        attic_aqi_history
      );
      update_body(data, "attic");
    }
  );
}

function update_livingroom() {
  fetch_data(
    "http://purpleair-f6ca.localdomain/json?live=true",
    function (data) {
      data["pm2.5_aqi_ave"] = update_moving_average(
        timestamp_now(),
        data["pm2.5_aqi"],
        winside_aqi_history
      );
      update_body(data, "winside");
    }
  );
}

function update_squidcave() {
  fetch_data(
    "http://purpleair-791d.localdomain/json?live=true",
    function (data) {
      data["pm2.5_aqi_ave"] = update_moving_average(
        timestamp_now(),
        data["pm2.5_aqi"],
        squidcave_aqi_history
      );
      update_body(data, "squidcave");
    }
  );
}
