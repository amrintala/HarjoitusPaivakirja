function init() {
    document.getElementById('logInfo').innerHTML = 'Haetaan tietokantaa...'
    document.getElementById('statInfo').innerHTML = 'Haetaan tietokantaa...'
    loadLog()    
}

//'Tallenna harjoitus'-napin onclick-funktio
async function addHarjoitus() {
    let tiedot = document.querySelectorAll('input')    
    let data = {"pvm": tiedot[0].value,
                "matka": tiedot[1].value,
                "syke": tiedot[2].value,
                "aika": tiedot[3].value
                }

    const response = await fetch('http://localhost:3000/harjoitukset/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify(data)
    })
    let harj = await response.json()
    clearAndLoad()
}

// Harjoituslistauksen tyhjäys ja uuden listauksen kutsu
function clearAndLoad() {
    let logList = document.getElementById('log-list')
    while (logList.hasChildNodes()) {
        logList.removeChild(logList.firstChild)
    }
    loadLog()
}

// Harjoitustietojen lataaminen palvelimelta ja käsittely näytölle sekä siirto tilastolaskentaan.
async function loadLog() {
    document.getElementById('logInfo').innerHTML = 'Ei harjoituksia valitulla aikavälillä'
    document.getElementById('statInfo').innerHTML = 'Ei harjoituksia valitulla aikavälillä'
    let logList = document.getElementById('log-list')    

    const response = await fetch('http://localhost:3000/harjoitukset/')
    const data = await response.json()

    if (data.length === 0){
        document.getElementById('loginfo').innerHTML = 'Ei harjoituksia tietokannassa.'
    }

    // Tilastointivälin valinnan mukainen päivien lukumäärä, joka myöhemmin syötetään päivämäärävertailuun.
    let check = 30
    let checklist = document.getElementsByName('tilastointivali')
    for (let i in checklist) {        
        if (checklist[i].checked){
            check = checklist[i].value
        }
    }    
       
    let date = new Date()
    date.setDate(date.getDate() - check)

    const loki = []
    
    // Valitun tilastointiajan mukaisten harjotusten valinta ja lisäys listalle sekä näytölle listaelementteihin. Näistä kappaleista lasketaan myöhemmin myös tilastokeskiarvot.
    for (let x in data) {
        let treenipaiva = new Date(data[x].pvm)        
        if (treenipaiva > date) {
            let li = createHarjoitusItem(data[x])        
            logList.appendChild(li)
            loki.push(data[x])
        }  
    }
    if (loki.length > 0) {
        document.getElementById('logInfo').innerHTML = ''
        document.getElementById('statInfo').innerHTML = ''
    }

    loadStat(loki)
}


// Lista-itemeiden luontifunktio.
function createHarjoitusItem(harjoitus) {    
    let li = document.createElement('li')    
    let li_a = document.createAttribute('id')
    li_a.value= harjoitus._id    
    li.setAttributeNode(li_a)
    
    let text = document.createTextNode(harjoitus.pvm.substring(0, 10) + ' -- '+ harjoitus.matka + 'km --  kesto ' + harjoitus.aika + 'min')
    li.appendChild(text)

    let span = document.createElement('span')
    let span_a = document.createAttribute('id')
    span_a.value = "delete"
    span.setAttributeNode(span_a)

    let span_text = document.createTextNode(' poista harjoitus ')
    span.appendChild(span_text)
    span.onclick = function () { poistaHarjoitus(harjoitus._id) }

    li.appendChild(span)

    return li
  }


  // Keskiarvotilastojen tulostus omalle alueelleen.
  function loadStat(list) {     
    let matkasum = 0
    let vauhtiavg = []
    let vauhtisum = 0
    let sykesum = 0

    for (let x in list) {
        matkasum += list[x].matka
        vauhtiavg.push(list[x].aika / list[x].matka)
        sykesum += list[x].syke
    }

    for (let y in vauhtiavg) {
        vauhtisum += vauhtiavg[y]
    }

    document.getElementById('avgmatka').innerHTML = Math.round(matkasum / list.length * 100) / 100
    document.getElementById('avgvauhti').innerHTML = Math.round(vauhtisum / list.length * 100) / 100
    document.getElementById('avgsyke').innerHTML = Math.round(sykesum / list.length)
    
    if (list.length == 0) {
        document.getElementById('avgmatka').innerHTML = "0"
        document.getElementById('avgvauhti').innerHTML = "0"
        document.getElementById('avgsyke').innerHTML = "0"
    }    
  }

  async function poistaHarjoitus(id) {
    const response = await fetch('http://localhost:3000/harjoitukset/'+id, {
        method: 'DELETE'
    })
    let responseJson = await response.json()
    let li = document.getElementById(id)
    li.parentNode.removeChild(li)

    let logList = document.getElementById('log-list')
    if (!logList.hasChildNodes()) {
      let infoText = document.getElementById('logInfo')
      infoText.innerHTML = 'Ei harjoituksia valitulla aikavälillä'
    }

    clearAndLoad()
  }