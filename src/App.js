import React, { useState } from 'react'
import './App.css'
import { Map, Marker, Popup, TileLayer, Polyline } from 'react-leaflet'
import karnak from './karnak'

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
      text +=
        point.getAttribute('lat') + ', ' + point.getAttribute('lon') + '\n'
    }
    text += '\n'
  }
  return text
}

const parseGpx = gpx =>
  Array.from(gpx.getElementsByTagName('trk')).map(parseTrk)
const parseTrk = track =>
  Array.from(track.getElementsByTagName('trkseg')).map(parseSeg)
const parseSeg = segment =>
  Array.from(segment.getElementsByTagName('trkpt')).map(parsePoint)
const parsePoint = point => ({
  lat: point.getAttribute('lat'),
  lon: point.getAttribute('lon')
})

const Upload = ({ addFile }) => {
  const upload = async e => {
    const target = e.target
    for (const file of e.target.files) {
      const xml = await readFile(file)
      const gpxXml = await parseXml(xml)
      window.gpx = gpxXml
      const gpx = parseGpx(gpxXml)
      console.log(gpx)
      addFile({ name: file.name, gpx: gpx })
    }
    target.value = null
  }

  return <input type="file" accept=".gpx" onChange={upload} multiple />
}

function App() {
  const [files, setFiles] = useState([karnak])
  const addFile = file => setFiles([...files, file])

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '20vw', height: '100%', overflow: 'scroll'}}>
        <Upload addFile={addFile} />
        {files.map(file => (
          <div key={file.name}>
            {file.name}
            {file.tracks.map((track, i) => (
              <div key={i}>
                Track {i + 1}
                {track.segments.map((segment, i) => (
                  <div key={i}>
                    Segment {i + 1}
                    {console.log(segment)}
                    {segment.points.map(point => (
                      <div key={point.lat + point.lon}>
                        {console.log(point)}
                        {point.lat}, {point.lon}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Map
        center={[-16.3937100131, 145.3324455407]}
        zoom={13}
        zoomSnap={0.1}
        maxZoom={15}
        style={{ flex: 1 }}
      >
        <TileLayer
          url="https://gisservices.information.qld.gov.au/arcgis/rest/services/Basemaps/QTopoBase_WebM/MapServer/tile/{z}/{y}/{x}"
          attribution="Qtopo"
        />
        {/* <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        /> */}

        {files.map(file =>
          file.tracks.map(track =>
            track.segments.map((segment, i) => (
              <Polyline
                key={file.name + track.name + i}
                positions={segment.points.map(({ lat, lon }) => [lat, lon])}
              />
            ))
          )
        )}

        {/* {files.map(file => (
          <Polyline
            key={file.name}
            positions={file.tacks[0].segments[0].points.map(({ lat, lon }) => [lat, lon])}
          />
        ))} */}
      </Map>
    </div>
  )
}

export default App
