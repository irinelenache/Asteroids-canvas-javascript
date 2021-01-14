        const FPS = 30;
        const DIMENSIUNE_NAVA = 30;
        const DIMENSIUNE_ASTEROID = 50;
        const DISTANTA_PERMISA_PENTRU_NAVA_NOUA = 20;
        const MAXIM_RACHETE_SIMULTAN = 3;
        const OPRIRE_AUTOMATA_NAVA = 0.7; //un fel de forta de frecare
        const VITEZA_ROTATIE_NAVA = 360 //grade pe secunda
        const NUMAR_ASTEROIZI_START = 3; //starting number
        const VIETI_START = 2;
        const MAXIM_ASTEROIZI = 10;

        var canv = document.getElementById("gameCanvas");
        var ctx = canv.getContext("2d");

        const shipThrust = 5; //acceleration of the ship in pixels per second

        var vieti = VIETI_START;
        var shipExploding = false;
        var asteroidScor = 10;
        var scorNewAsteroid = 0;
        var scorNewLife = 0;
        var scor = 0;
        var ship = newShip();

        var vectorAsteroizi = [];
        initiazaAsteroizi();


        // Seteaza evenimente pentru butoane (controale)

        document.addEventListener("keydown", keyDown)
        document.addEventListener("keyup", keyUp)

        function keyDown( /** @type {KeyboardEvent}*/ ev) {
            switch (ev.keyCode) {
                case 37: //sageata stanga
                    ship.mergeStanga = true;
                    break;
                case 38: //sageata inainte
                    ship.mergeInainte = true;
                    break;
                case 39: //sageata dreapta
                    ship.mergeDreapta = true;
                    break;
                case 40: //sageata dreapta
                    ship.mergeInapoi = true;
                    break;
                case 90: //z - rotire stanga
                    ship.rot = VITEZA_ROTATIE_NAVA / 180 * Math.PI / FPS
                    break;
                case 67: //c - rotire dreapta
                    ship.rot = -VITEZA_ROTATIE_NAVA / 180 * Math.PI / FPS
                    break;
                case 88: //x - racheta
                    lansareRacheta();
                    break;
            }
        }

        function keyUp( /** @type {KeyboardEvent}*/ ev) {
            switch (ev.keyCode) {
                case 37: //sageata stanga
                    ship.mergeStanga = false;
                    break;
                case 38: //sageata inainte
                    ship.mergeInainte = false;
                    break;
                case 39: //sageata dreapta
                    ship.mergeDreapta = false;
                    break;
                case 40: //sageata spate
                    ship.mergeInapoi = false;
                    break;
                case 90: //z - rotire stanga
                    ship.rot = 0
                    break;
                case 67: //c - rotire dreapta
                    ship.rot = 0
                    break;
                case 88: //permite sa traga iar cu racheta
                    ship.poateLansa = true;
            }
        }


        // Functii asteroizi

        function newAsteroid(x, y) {
            var asteroid = {
                x: x,
                y: y,
                viteza: Math.random() + 1.5,
                lovituriNecesare: Math.floor(Math.random() * 4 + 1),
                r: DIMENSIUNE_ASTEROID,
                a: Math.random() * Math.PI * 2
            }
            return asteroid;
        }

        function initiazaAsteroizi() {
            vectorAsteroizi = [];
            var x, y
            for (var i = 0; i < NUMAR_ASTEROIZI_START; i++) {
                do {
                    x = Math.random() * canv.width;
                    y = Math.random() * canv.height;
                } while (distantaIntreDouaPuncte(x, y, ship.x, ship.y) < 120)
                vectorAsteroizi.push(newAsteroid(x, y));
            }
        }

        function distantaIntreDouaPuncte(x1, y1, x2, y2) {
            return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
        }


        function gameOver() {
            ship.dead = true;
        }
        

        // Functii nava

        function newShip() {
            return {
                x: canv.width / 2,
                y: canv.height / 2,
                r: DIMENSIUNE_NAVA / 2, //raza
                a: 90 / 180 * Math.PI, // (angle) orientarea navei in radiani
                rot: 0,
                mergeInainte: false,
                deplasareInainte: {
                    x: 0,
                    y: 0
                },
                mergeInapoi: false,
                deplasareInapoi: {
                    x: 0,
                    y: 0
                },
                mergeStanga: false,
                deplasareStanga: {
                    x: 0,
                    y: 0
                },
                mergeDreapta: false,
                deplasareDreapta: {
                    x: 0,
                    y: 0
                },
                poateLansa: true, //folosit pentru a nu tine apasat pe x
                rachete: [],
                dead: false
            }
        }

        function explozieNava() {
            vieti--;
            shipExploding = true;
        }

        function lansareRacheta() {
            // creaza obiect
            if (ship.poateLansa && ship.rachete.length < MAXIM_RACHETE_SIMULTAN) {
                ship.rachete.push({ //trage din varful navei
                    x: ship.x + ship.r * Math.cos(ship.a),
                    y: ship.y - ship.r * Math.sin(ship.a),
                    xviteza: 200 * Math.cos(ship.a) / FPS,
                    yviteza: -200 * Math.sin(ship.a) / FPS //trigonometry stuff
                })

            }

            ship.poateLansa = false;
        }

        

        gameLoop = setInterval(update, 1000 / FPS); //game loop - se updateaza de 30 de ori pe secunda

        function update() {
            // Deseneaza spatiul
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canv.width, canv.height);

            // Miscare nava
            if (ship.mergeInainte) {
                ship.deplasareInainte.x += shipThrust * Math.cos(ship.a) / FPS;
                ship.deplasareInainte.y -= shipThrust * Math.sin(ship.a) / FPS;
            } else {
                ship.deplasareInainte.x -= OPRIRE_AUTOMATA_NAVA * ship.deplasareInainte.x / FPS;
                ship.deplasareInainte.y -= OPRIRE_AUTOMATA_NAVA * ship.deplasareInainte.y / FPS;
            }

            if (ship.mergeStanga) {
                ship.deplasareStanga.x += shipThrust * Math.cos(ship.a + (90 / 180 * Math.PI)) /
                    FPS; //adauga in plus 90 grade la unghi ca sa mearga in stanga
                ship.deplasareStanga.y -= shipThrust * Math.sin(ship.a + (90 / 180 * Math.PI)) / FPS;
            } else {
                ship.deplasareStanga.x -= OPRIRE_AUTOMATA_NAVA * ship.deplasareStanga.x / FPS;
                ship.deplasareStanga.y -= OPRIRE_AUTOMATA_NAVA * ship.deplasareStanga.y / FPS;
            }

            if (ship.mergeDreapta) {
                ship.deplasareDreapta.x -= shipThrust * Math.cos(ship.a + (90 / 180 * Math.PI)) / FPS;
                ship.deplasareDreapta.y += shipThrust * Math.sin(ship.a + (90 / 180 * Math.PI)) / FPS;
            } else {
                ship.deplasareDreapta.x -= OPRIRE_AUTOMATA_NAVA * ship.deplasareDreapta.x / FPS;
                ship.deplasareDreapta.y -= OPRIRE_AUTOMATA_NAVA * ship.deplasareDreapta.y / FPS;
            }

            if (ship.mergeInapoi) {
                ship.deplasareInapoi.x -= shipThrust * Math.cos(ship.a) / FPS;
                ship.deplasareInapoi.y += shipThrust * Math.sin(ship.a) / FPS;
            } else {
                ship.deplasareInapoi.x -= OPRIRE_AUTOMATA_NAVA * ship.deplasareInapoi.x / FPS;
                ship.deplasareInapoi.y -= OPRIRE_AUTOMATA_NAVA * ship.deplasareInapoi.y / FPS;
            }

            if (!shipExploding) {
                // Deseneaza nava
                ctx.strokeStyle = 'white'
                ctx.lineWidth = DIMENSIUNE_NAVA / 20
                ctx.beginPath()
                ctx.moveTo( //varf nava
                    ship.x + ship.r * Math.cos(ship.a),
                    ship.y - ship.r * Math.sin(ship.a)
                );

                ctx.lineTo( //parte stanga nava
                    ship.x - ship.r * (Math.cos(ship.a) + Math.sin(ship.a)),
                    ship.y + ship.r * (Math.sin(ship.a) - Math.cos(ship.a))
                )

                ctx.lineTo( //parte dreapta nava
                    ship.x - ship.r * (Math.cos(ship.a) - Math.sin(ship.a)),
                    ship.y + ship.r * (Math.sin(ship.a) + Math.cos(ship.a))
                )
                ctx.closePath();
                ctx.stroke();
            } else {
                if (vieti == 0) {
                    gameOver();
                } else {
                    var permiteCreareNava = true;
                    for (var i = 0; i < vectorAsteroizi.length; i++) {
                        if (distantaIntreDouaPuncte(canv.width / 2, canv.height / 2, vectorAsteroizi[i].x, vectorAsteroizi[i].y) <
                            DIMENSIUNE_NAVA + DIMENSIUNE_ASTEROID + DISTANTA_PERMISA_PENTRU_NAVA_NOUA)
                            permiteCreareNava = false;
                    }
                    if (permiteCreareNava == true) {
                        ship = newShip();
                        shipExploding = false;
                        console.log(vieti)
                    }
                }
            }

            // Deseneaza rachete
            for (var i = 0; i < ship.rachete.length; i++) {
                ctx.fillStyle = "white"
                ctx.beginPath();
                ctx.fillRect(ship.rachete[i].x, ship.rachete[i].y, 3, 5)
            }

            // Detecteaza coliziunea rachetei cu un asteroid
            var ax, ay, ar, rx, ry
            for (var i = 0; i < vectorAsteroizi.length; i++) {
                //transmitere proprietati asteroid in variabilele ax ay ar
                ax = vectorAsteroizi[i].x
                ay = vectorAsteroizi[i].y
                ar = vectorAsteroizi[i].r

                for (var j = 0; j < ship.rachete.length; j++) {
                    rx = ship.rachete[j].x
                    ry = ship.rachete[j].y

                    //Detecteaza lovitura propriu-zisa
                    if (distantaIntreDouaPuncte(ax, ay, rx, ry) < ar) {
                        ship.rachete.splice(j, 1)
                        vectorAsteroizi[i].lovituriNecesare--;
                        if (vectorAsteroizi[i].lovituriNecesare == 0) {
                            vectorAsteroizi.splice(i, 1)
                            var newAsteroidX = Math.random() * canv.width
                            var newAsteroidY = Math.random() * canv.height

                            while (distantaIntreDouaPuncte(ship.x, ship.y, newAsteroidX, newAsteroidY) < 100) {
                                newAsteroidX = Math.random() * canv.width
                                newAsteroidY = Math.random() * canv.height
                            }

                            vectorAsteroizi.push(newAsteroid(newAsteroidX, newAsteroidY));
                            scor += asteroidScor;
                            scorNewAsteroid += asteroidScor;
                            scorNewLife += asteroidScor;

                            //adauga mai multi asteroizi la un anumit scor, dar nu mai mult decat MAXIM_ASTEROIZI
                            if (scorNewAsteroid >= 100 && vectorAsteroizi.length <= MAXIM_ASTEROIZI) {
                                var newAsteroidX = Math.random() * canv.width
                                var newAsteroidY = Math.random() * canv.height

                                while (distantaIntreDouaPuncte(ship.x, ship.y, newAsteroidX, newAsteroidY) < 100) {
                                    newAsteroidX = Math.random() * canv.width
                                    newAsteroidY = Math.random() * canv.height
                                }

                                vectorAsteroizi.push(newAsteroid(newAsteroidX, newAsteroidY));

                                scorNewAsteroid = 0;
                                asteroidScor += 5;
                            }

                            //viata in plus daca s-au facut 500 puncte si sunt mai putin de 3 vieti
                            if (scorNewLife >= 500) {
                                if (vieti < 3) {
                                    vieti++;
                                    scorNewLife = 0;
                                }
                                else{
                                    scorNewLife -= 100; //evita cazul de a primi o viata in plus instant cand pierde a 3a viata si are deja puncte facute
                                }
                            }

                        }
                    }
                }
            }

            // Miscare rachete
            for (var i = 0; i < ship.rachete.length; i++) {
                ship.rachete[i].x += ship.rachete[i].xviteza;
                ship.rachete[i].y += ship.rachete[i].yviteza;

                //handle edges
                if (ship.rachete[i].x < 0) {
                    ship.rachete.splice(i, 1)
                } else if (ship.rachete[i].x > canv.width) {
                    ship.rachete.splice(i, 1)
                } else if (ship.rachete[i].y < 0) {
                    ship.rachete.splice(i, 1)
                } else if (ship.rachete[i].y > canv.height) {
                    ship.rachete.splice(i, 1)
                }

            }

            // Ciocnire intre nava si asteroid
            if (!shipExploding) {

                for (var i = 0; i < vectorAsteroizi.length; i++) {
                    if (distantaIntreDouaPuncte(ship.x, ship.y, vectorAsteroizi[i].x, vectorAsteroizi[i].y) < ship.r + vectorAsteroizi[i]
                        .r) {
                        explozieNava();
                    }
                }
            }

            // Rotatie nava
            ship.a += ship.rot;


            // Miscare nava
            ship.x += ship.deplasareInainte.x;
            ship.y += ship.deplasareInainte.y;

            ship.x += ship.deplasareStanga.x;
            ship.y += ship.deplasareStanga.y;

            ship.x += ship.deplasareDreapta.x;
            ship.y += ship.deplasareDreapta.y;

            ship.x += ship.deplasareInapoi.x;
            ship.y += ship.deplasareInapoi.y;

            // Trecere nava prin marginile ecranului
            if (ship.x < 0 - ship.r) {
                ship.x = canv.width + ship.r;
            } else if (ship.x > canv.width + ship.r) {
                ship.x = 0 - ship.r;
            }

            if (ship.y < 0 - ship.r) {
                ship.y = canv.height + ship.r;
            } else if (ship.y > canv.height + ship.r) {
                ship.y = 0 - ship.r;
            }

            ctx.lineWidth = DIMENSIUNE_NAVA / 20;


            // Deseneaza asteroizi
            for (var i = 0; i < vectorAsteroizi.length; i++) {
                // Culori in functie de numarul de lovituri necesare
                if (vectorAsteroizi[i].lovituriNecesare == 4) {
                    ctx.fillStyle = "green"
                    deseneazaAsteroid()
                } else if (vectorAsteroizi[i].lovituriNecesare == 3) {
                    ctx.fillStyle = "yellow"
                    deseneazaAsteroid()
                } else if (vectorAsteroizi[i].lovituriNecesare == 2) {
                    ctx.fillStyle = "orange"
                    deseneazaAsteroid()
                } else if (vectorAsteroizi[i].lovituriNecesare == 1) {
                    ctx.fillStyle = "red"
                    deseneazaAsteroid()
                }

                // Functie desen asteroid
                function deseneazaAsteroid() {
                    ctx.beginPath();
                    ctx.arc(vectorAsteroizi[i].x, vectorAsteroizi[i].y, vectorAsteroizi[i].r, 0, Math.PI * 2)
                    ctx.closePath();
                    ctx.fill();
                }


                // Miscare asteroid
                vectorAsteroizi[i].x += vectorAsteroizi[i].viteza * Math.cos(vectorAsteroizi[i].a);
                vectorAsteroizi[i].y += vectorAsteroizi[i].viteza * Math.sin(vectorAsteroizi[i].a);

                // Trecere asteroizi prin marginile ecranului
                if (vectorAsteroizi[i].x < 0 - vectorAsteroizi[i].r) {
                    vectorAsteroizi[i].x = canv.width + vectorAsteroizi[i].r
                } else if (vectorAsteroizi[i].x > canv.width + vectorAsteroizi[i].r) {
                    vectorAsteroizi[i].x = 0 - vectorAsteroizi[i].r
                }

                if (vectorAsteroizi[i].y < 0 - vectorAsteroizi[i].r) {
                    vectorAsteroizi[i].y = canv.height + vectorAsteroizi[i].r
                } else if (vectorAsteroizi[i].y > canv.height + vectorAsteroizi[i].r) {
                    vectorAsteroizi[i].y = 0 - vectorAsteroizi[i].r
                }
            }


            if(ship.dead == true){
                clearInterval(gameLoop)
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canv.width, canv.height);

                ctx.fillStyle = "white"
                ctx.textAlign = "center"
                ctx.font = "30px Arial"
                ctx.fillText("GAME OVER \r\n" + "Your score: " + scor,canv.width/2,canv.height/2)
            }

            // Afisare scor si numar vieti
            var scorHtml = '<h1>Scor: ' + scor + '</h1>'
            document.getElementById("scor").innerHTML = scorHtml
            var vietiHtml = '<h1>Vieti: ' + vieti + '</h1>'
            document.getElementById("vieti").innerHTML = vietiHtml
        }