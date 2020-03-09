import React, { useState } from 'react'
import './App.css'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'

const readFile = file =>
  new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsText(file)
  })

const parseXml = xml =>
  new Promise(resolve => {
    const parser = new DOMParser()
    const gpx = parser.parseFromString(xml, 'application/xml')
    resolve(gpx)
  })

const save = () => {
  document.implementation.createDocument(
    'http://www.topografix.com/GPX/1/1',
    'Name'
  )
  var s = new XMLSerializer()
  var d = document
  var str = s.serializeToString(d)
  // saveXML(str)
}

const trkToText = trk => {
  let text = ''
  const segments = trk.getElementsByTagName('trkseg')
  for (const segment of segments) {
    const points = segment.getElementsByTagName('trkpt')
    for (const point of points) {
      text += point.getAttribute('lat') + ', ' + point.getAttribute('lon') + '\n'
    }
    text += '\n'
  }
  return text
}

const gpxToText = gpx => {
  const tracks = gpx.getElementsByTagName('trk')
  if (tracks.length === 1) {
    return trkToText(tracks[0])
  } else {
    let text = ''
    for (const trk of tracks) {
      text += '## track\n' + trkToText(trk) + '\n'
    }
    return text
  }
}

const Upload = ({ addTrack }) => {
  const upload = async e => {
    for (const file of e.target.files) {
      const xml = await readFile(file)
      const gpx = await parseXml(xml)
      window.gpx = gpx
      const text = gpxToText(gpx)
      console.log('# ' + file.name + '\n' + text)
      addTrack('# ' + file.name + '\n' + text)
    }
  }

  return <input type="file" accept=".gpx" onChange={upload} />
}

function App() {
  const [tracks, setTracks] = useState('')
  const addTrack = track => setTracks(tracks + track)
  const position = [-16.3937100131, 145.3324455407]
  return (
    <div className="App">
      <Map center={position} zoom={13}>
        <TileLayer
          url="https://gisservices.information.qld.gov.au/arcgis/rest/services/Basemaps/QTopoBase_WebM/MapServer/tile/{z}/{y}/{x}"
          attribution="Qtopo"
        />
        {/* <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        /> */}
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup.
            <br />
            Easily customizable.
          </Popup>
        </Marker>
      </Map>
      <Upload addTrack={addTrack} />
    </div>
  )
}

export default App
