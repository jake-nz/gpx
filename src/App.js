import React, { useState } from 'react'
import { Map, Polyline, TileLayer } from 'react-leaflet'
import './App.css'
// import karnak from './karnak'

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

// const save = () => {
//   document.implementation.createDocument(
//     'http://www.topografix.com/GPX/1/1',
//     'Name'
//   )
//   var s = new XMLSerializer()
//   var d = document
//   var str = s.serializeToString(d)
//   // saveXML(str)
// }

const parseGpx = gpx =>
  Array.from(gpx.getElementsByTagName('trk')).map(parseTrk)

const parseTrk = track => ({
  segments: Array.from(track.getElementsByTagName('trkseg')).map(parseSeg)
})
const parseSeg = segment => ({
  points: Array.from(segment.getElementsByTagName('trkpt')).map(parsePoint)
})
const parsePoint = point => ({
  lat: parseFloat(point.getAttribute('lat')),
  lon: parseFloat(point.getAttribute('lon'))
})

const Upload = ({ addFile }) => {
  const upload = async e => {
    const target = e.target
    for (const file of e.target.files) {
      const xml = await readFile(file)
      const gpxXml = await parseXml(xml)
      window.gpx = gpxXml
      const tracks = parseGpx(gpxXml)
      addFile({ name: file.name, tracks })
    }
    target.value = null
  }

  return <input type="file" accept=".gpx" onChange={upload} multiple />
}

const objectToText = files => {
  let text = ''
  files.forEach(file => {
    text += `${file.name}\n`
    file.tracks.forEach((track, i) => {
      text += `"${track.name}"\n`
      track.segments.forEach((segment, i) => {
        text += `Segment ${i}\n`
        segment.points.forEach(point => {
          text += point
            ? `${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}\n`
            : '\n'
        })
      })
    })
  })
  return text
}

const textToObject = text => {
  const lines = text.split('\n')
  const files = []
  let fileNumber = -1
  let trackNumber = -1
  let segmentNumber = -1
  while (lines.length) {
    const line = lines.shift()
    if (line.match(/\.gpx$/)) {
      files.push({
        name: line,
        tracks: []
      })
      fileNumber++
    } else if (line.match(/^"(.*)"$/)) {
      files[fileNumber].tracks.push({
        name: line.match(/^"(.*)"$/)[1],
        segments: []
      })
      trackNumber++
    } else if (line.match(/^Segment \d+$/)) {
      files[fileNumber].tracks[trackNumber].segments.push({
        points: []
      })
      segmentNumber++
    } else if (line.match(/^-?\d+\.\d+,\s+-?\d+\.\d+$/)) {
      const [lat, lon] = line.split(',')
      files[fileNumber].tracks[trackNumber].segments[segmentNumber].points.push(
        {
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        }
      )
    } else if (!line) {
      files[fileNumber].tracks[trackNumber].segments[segmentNumber].points.push(
        null
      )
    } else {
      console.warn('Unmatched line!', line)
    }
  }
  return files
}

const textToPoints = text => {
  const lines = text.split('\n')
  const points = []

  while (lines.length) {
    const line = lines.shift()
    if (!line) {
      continue
    } else if (line.match(/^-?\d+\.\d+,\s+-?\d+\.\d+$/)) {
      const [lat, lon] = line.split(',')
      points.push([parseFloat(lat), parseFloat(lon)])
    } else {
      console.warn('Unmatched line!', line)
    }
  }

  return points
}

function App() {
  // const files = useSelector(state => state.files)
  const [files, setFiles] = useState([])
  const addFile = file => setFiles([...files, file])

  const [selected, setSelected] = useState()
  const onSelect = () => {
    setSelected(window.getSelection().toString())
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '20vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Upload addFile={addFile} />
        <textarea
          onChange={e => setFiles(textToObject(e.target.value))}
          value={objectToText(files)}
          onSelect={onSelect}
          style={{
            fontFamily: 'monospace',
            flex: 1,
            width: '100%'
          }}
        />
      </div>
      <Map
        center={[-16.5, 145.5]}
        zoom={10}
        zoomSnap={0.1}
        // maxZoom={15}
        style={{ flex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          maxZoom={17}
          attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        />
        <TileLayer
          url="https://gisservices.information.qld.gov.au/arcgis/rest/services/Basemaps/QTopoBase_WebM/MapServer/tile/{z}/{y}/{x}"
          maxZoom={15}
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
                positions={segment.points
                  .filter(p => p)
                  .map(({ lat, lon }) => [lat, lon])}
              />
            ))
          )
        )}

        {selected && (
          <Polyline positions={textToPoints(selected)} color="red" />
        )}
      </Map>
    </div>
  )
}

export default App
