import React, { useState, useEffect } from 'react'
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete
} from '@react-google-maps/api'
import { connect } from 'react-redux'
import { addLocation, removeLocation } from './store'
import googleApiKey from './config'
import {
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Box,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import LocationSearchingIcon from '@mui/icons-material/LocationSearching'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import darkModeStyles from './darkModeStyle'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import DownloadIcon from '@mui/icons-material/Download'

const libraries = ['places']

const mapContainerStyle = {
  position: 'relative',
  width: '100vw',
  height: '100vh'
}

const center = {
  lat: 7.2905715,
  lng: 80.6337262
}

const sidebarStyle = {
  position: 'absolute',
  top: 100,
  left: 20,
  zIndex: 1,
  backgroundColor: 'white',
  padding: '20px',
  minWidth: '24%',
  maxHeight: '60%',
  overflow: 'auto'
}

const App = ({ savedLocations, addLocation, removeLocation }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleApiKey,
    libraries
  })

  const [map, setMap] = useState(null)
  const [clickedLocation, setClickedLocation] = useState(null)
  const [addButtonVisible, setAddButtonVisible] = useState(false)
  const [markers, setMarkers] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [autocomplete, setAutocomplete] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      setMarkers(savedLocations)
    }
  }, [isLoaded, savedLocations])

  const handleMapClick = event => {
    setClickedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    })
    setAddButtonVisible(true)
  }

  const handleAddLocation = () => {
    if (clickedLocation) {
      addLocation(clickedLocation)
      setClickedLocation(null)
      setAddButtonVisible(false)
    }
  }

  const handleShowLocation = location => {
    if (map) {
      map.panTo(location)
    }
  }

  const handleRemoveLocation = index => {
    removeLocation(index)
  }

  const handleSearch = e => {
    setSearchValue(e.target.value)
  }

  const handlePlaceSelect = () => {
    const place = autocomplete.getPlace()
    if (!place.geometry || !place.geometry.location) {
      return
    }

    if (!map) {
      console.error('Google Map not loaded!')
      return
    }

    const viewport = place.geometry.viewport

    if (viewport) {
      const bounds = {
        north: viewport.getNorthEast().lat(),
        south: viewport.getSouthWest().lat(),
        east: viewport.getNorthEast().lng(),
        west: viewport.getSouthWest().lng()
      }

      const mapBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(bounds.south, bounds.west),
        new window.google.maps.LatLng(bounds.north, bounds.east)
      )

      map.fitBounds(mapBounds)
    }

    setSearchValue('')
  }

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleDownloadSavedLocations = () => {
    const docContent = savedLocations
      .map(
        location => `Latitude: ${location.lat}, Longitude: ${location.lng}\n`
      )
      .join('')

    const blob = new Blob([docContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'saved_locations.doc'
    document.body.appendChild(link)
    link.click()
  }

  if (loadError) {
    return <Box className='error'>Error loading maps</Box>
  }

  if (!isLoaded) {
    return <Box className='loading'>Loading maps</Box>
  }

  return (
    <Box>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
        onClick={handleMapClick}
        onLoad={map => setMap(map)}
        options={darkMode ? darkModeStyles : { styles: [] }}
      >
        {markers.map((location, index) => (
          <Marker
            key={index}
            position={location}
            onClick={() => handleShowLocation(location)}
          />
        ))}
      </GoogleMap>
      <Box style={sidebarStyle}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          margin='10px 0px'
        >
          <Typography style={{ fontSize: '20px', fontWeight: '500' }}>
            Theme: {darkMode ? 'Dark' : 'Light'}
          </Typography>
          <ToggleButtonGroup
            value={darkMode ? 'dark' : 'light'}
            exclusive
            onChange={handleToggleDarkMode}
            aria-label='dark mode toggle'
          >
            <ToggleButton
              style={{ padding: '5px', borderRadius: '50px 0px 0px 50px' }}
              value='light'
              aria-label='light mode'
            >
              <WbSunnyIcon style={{ fontSize: '20px' }} />
            </ToggleButton>
            <ToggleButton
              style={{ padding: '5px', borderRadius: '0px 50px 50px 0px' }}
              value='dark'
              aria-label='dark mode'
            >
              <DarkModeIcon style={{ fontSize: '20px' }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {addButtonVisible && (
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            marginBottom='20px'
          >
            <Button
              variant='contained'
              color='primary'
              onClick={handleAddLocation}
            >
              Add this Location
            </Button>
          </Box>
        )}
        <Autocomplete
          onLoad={autocomplete => setAutocomplete(autocomplete)}
          onPlaceChanged={handlePlaceSelect}
        >
          <TextField
            id='outlined-basic'
            label='Search Location'
            variant='outlined'
            fullWidth
            value={searchValue}
            onChange={handleSearch}
          />
        </Autocomplete>
        <Box
          display='flex'
          flexDirection='row'
          justifyContent='space-between'
          alignItems='center'
          margin='10px 0px'
          onClick={handleDownloadSavedLocations}
        >
          <Typography
            style={{
              fontSize: '20px',
              fontWeight: '600'
            }}
          >
            Saved Locations
          </Typography>
          <Box style={{ cursor: 'pointer' }}>
            <DownloadIcon />
          </Box>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ textAlign: 'center' }}>Lat/Long</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {savedLocations.map((location, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box>
                    <Typography style={{ fontSize: '14px' }}>
                      Lat - {location.lat}
                    </Typography>
                    <Typography style={{ fontSize: '14px' }}>
                      Lng - {location.lng}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    variant='contained'
                    color='primary'
                    onClick={() => handleShowLocation(location)}
                  >
                    <LocationSearchingIcon />
                  </IconButton>
                  <IconButton
                    variant='contained'
                    color='secondary'
                    onClick={() => handleRemoveLocation(index)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}

const mapStateToProps = state => ({
  savedLocations: state.savedLocations
})

const mapDispatchToProps = {
  addLocation,
  removeLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
