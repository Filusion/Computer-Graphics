
var c = document.getElementById("myCanvas");
var ctx = c.getContext('2d');


document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("myCanvas");
    const output = document.getElementById("output");
  
    ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });
  
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  
    dropZone.addEventListener("drop", handleDrop, false);


  async function handleDrop(e) {
      const files = e.dataTransfer.files;
      if (files.length) {
        const file = files[0];
        if (file.type === "application/json") {

          var file_text = await file.text();
          
          var json_data = JSON.parse(file_text);
          
          console.log("JSON file read.")

          models = saveModels(json_data);
          scenes = saveScenes(json_data);
          printMatrika(models);
          console.log("----------------");
          printMatrika(scenes);
        
          console.log("Variables models and scenes saved.")

          transformacii(models, scenes);

        } else {
          output.textContent = "Please drop a valid JSON file.";
        }
      }
    }

    
    function saveModels(json_data){
      var models = [];
      for (let key in json_data) {
        if(key == "models") {
          for (let i = 0; i < json_data[key].length; i++){
            models.push(json_data[key][i]);
          }
        }
      }
      return models;
    }


    function saveScenes(json_data) {
      var scenes = [];
      for (let key in json_data) {
        if(key == "scene") {
          for (let i = 0; i < json_data[key].length; i++){
            scenes.push(json_data[key][i]);
          }
        }
      }
      return scenes;
    }


    function transformacii(models, scenes) {
      var lista = [];
      var flag = false; // flag ki pove ali je bila izvedena transformacija
      scenes.forEach(value => {
        for (const key in value) {
          if (key == "model") {
            var index = value[key];
            lista = [];
          }
          else if (key == "transforms") {
            if (value[key].length == 0)
              continue;
            flag = true; // transformation => true
            value[key].forEach(vrednosti => {
              
              if (vrednosti["type"] == "scale") {
                // scaling matriko
                var scalingMatrix = [
                  [vrednosti["factor"][0], 0, 0],
                  [0, vrednosti["factor"][1], 0],
                  [0, 0, 1]
                ];
                lista.push(scalingMatrix);
               
              }

              if (vrednosti["type"] == "rotate") {
                // rotating matriko
                var angle = [vrednosti["angle"]];
                var sin = Math.sin(angle);
                var cos = Math.cos(angle);
                var rotatingMatrix = [
                  [cos, -sin, 0],
                  [sin, cos, 0],
                  [0, 0, 1]
                ];
                lista.push(rotatingMatrix);

              }

              if (vrednosti["type"] == "translate") {
                // translating matriko
                var translatingMatrix = [
                  [1, 0, vrednosti["vector"][0]],
                  [0, 1, vrednosti["vector"][1]],
                  [0, 0, 1]
                ];
                lista.push(translatingMatrix);
              }
            });
          }

          if(flag) {
          // skupno transformacijsko matriko
          var matrika = lista[0];
          for (let i = 1; i < lista.length; i++){
            matrika = zmnoziMatrike(lista[i], matrika);
          }

          lista = [];
          drawModel(models, index, matrika); // model je bil narisan
          flag = false; // flag => false za nasljedno transformacijo
          }
        }
      }); 
    }


    // pomozna funkcija za mnozenje matrik
    function sestej(x, y, a, b) {
      var res = 0;
      for (let i = 0; i < b.length; i++) {
          res += a[x][i] * b[i][y];
      }
      return res;
  }

  
  function zmnoziMatrike(a, b) {
      var zmnozeni;
      if (a[0].length !== b.length) {
          zmnozeni = [[]]; 
          console.log("Tabeli nemoremo zmnožiti!"); 
          return zmnozeni;
      } else {
          zmnozeni = new Array(a.length).fill(null).map(() => new Array(b[0].length).fill(0));
          for (let i = 0; i < zmnozeni.length; i++) {
              for (let j = 0; j < zmnozeni[0].length; j++) {
                  zmnozeni[i][j] = sestej(i, j, a, b);
              }
          }
          return zmnozeni;
      }
  }

    
    // Drawing the model
    function drawModel(models, index, matrika){
      const mappingMatrix = [ // matriko za zaslonske preslikave
        [256, 0, 256],
        [0, -256, 256],
        [0, 0, 1]
      ];
      for (let i = 0; i < models[index].length; i++) { 
          // iskanje koordinat modela

          var x1 = models[index][i][0][0];
          var y1 = models[index][i][0][1];
          var x2 = models[index][i][1][0];
          var y2 = models[index][i][1][1];
          var tocka1 = [[x1], [y1], [1]];
          var tocka2 = [[x2], [y2], [1]];

          // izracun novih koordinata (transformaciska matrika)
          var tocka1Transformirana = zmnoziMatrike(matrika, tocka1);
          var tocka2Transformirana= zmnoziMatrike(matrika, tocka2);

          // izracun koncne koordinate (matrika zaslonske preslikave)
          var tocka1Mapped= zmnoziMatrike(mappingMatrix, tocka1Transformirana);
          var tocka2Mapped = zmnoziMatrike(mappingMatrix, tocka2Transformirana)
          
          // risanje
          ctx.beginPath();
          ctx.moveTo(tocka1Mapped[0][0], tocka1Mapped[1][0]);
          ctx.lineTo(tocka2Mapped[0][0], tocka2Mapped[1][0]);
          ctx.stroke();
        }
      
        console.log("Model drawn!");
    }
  });
  

  // Testing functions
  function printModeli(models) {
    for (let i = 0; i < models.length; i++) { 
      for (let j = 0; j < models[i].length; j++) {
        var x1 = models[i][j][0][0];
        var y1 = models[i][j][0][1];
        var x2 = models[i][j][1][0];
        var y2 = models[i][j][1][1];
        console.log(x1, y1);
        console.log(x2, y2);
      }
    }
  }

  
  function printMatrika(matrika) {
    for (let i = 0; i < matrika.length; i++) {
      let row = ''; 
      for (let j = 0; j < matrika[i].length; j++) {
          row += matrika[i][j] + ' '; 
      }
      console.log(row.trim()); 
  }
  }