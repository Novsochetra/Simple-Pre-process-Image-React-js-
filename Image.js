import React, {createRef} from 'react'

export default class Img extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isInViewport: false,
      width: 0,
      height: 0,
      lqipLoaded: false,
      fullsizeLoaded: false,
    }

    this.imgRef = createRef()
    this.window = typeof window !== 'undefined' && window
    this.handleScroll = this.handleScroll.bind(this)
    this.handleResize = this.handleResize.bind(this)
    this.isInViewport = this.isInViewport.bind(this)
  }

  isInViewport() {
    const windowHeight = this.window.innerHeight
    const imageTopPosition = this.imgRef.current.getBoundingClientRect().top
    const buffer =
      typeof this.props.buffer === 'number' &&
      this.props.buffer > 1 &&
      this.props.buffer < 10
        ? this.props.buffer
        : 1.5
    if (windowHeight * buffer > imageTopPosition) {
      return true
    }
    return false
  }

  handleScroll() {
    if (this.imgRef.current && !this.state.lqipLoaded) {
      this.setState({
        isInViewport: this.isInViewport(),
      })
    }
  }

  handleResize() {
    if (this.imgRef.current) {
      const width = this.imgRef.current.clientWidth
      const currentWidth = this.state.width
      const difference = Math.abs(width - currentWidth)
      const differencePercentage = (difference / currentWidth) * 100
      const isInViewport = this.isInViewport()
      if (differencePercentage >= 10) {
        this.setState({
          width,
          lqipLoaded: false,
          fullsizeLoaded: isInViewport,
          isInViewport,
        })
      }
    }
  }

  componentDidMount() {
    const width = this.imgRef.current.clientWidth

    this.setState({
      width,
      isInViewport: this.isInViewport(),
    })

    this.window.addEventListener('scroll', this.handleScroll)
    this.window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    this.window.removeEventListener('scroll', this.handleScroll)
    this.window.removeEventListener('resize', this.handleResize)
  }

  render() {
    // Destructure props and state
    const {src, alt, options = {}, ext = 'jpg', domain, supports} = this.props
    const {isInViewport, width, fullsizeLoaded} = this.state

    const imageSrc = src

    const styles = {
      figure: {
        position: 'relative',
        margin: 0,
      },
      lqip: {
        filter: 'blur(20px) drop-shadow(0px 0px 0px lightgray) opacity(0.8)',
        WebkitFilter:
          'blur(20px) drop-shadow(0px 0px 0px lightgray) opacity(0.8)',
        MozFilter: 'blur(20px) drop-shadow(0px 0px 0px lightgray) opacity(0.8)',
        width: '100%',
        height: '100%',
        top: '0px',
        left: '0px',
        transition: 'all 2s ease-in',
        position: 'absolute',
      },
      fullsize: {
        width: '100%',
        transition: 'all 0.1s ease-in',
        display: 'block',
      },
    }

    // When the fullsize image is loaded, fade out the LQIP
    if (fullsizeLoaded) {
      styles.lqip.opacity = 0
    }

    const missingALt = 'ALT TEXT IS REQUIRED'

    return (
      <figure style={styles.figure} ref={this.imgRef}>
        {isInViewport && width > 0 ? (
          <React.Fragment>
            {/* Load fullsize image in background */}
            <img
              onLoad={() => {
                this.setState({fullsizeLoaded: true})
              }}
              style={styles.fullsize}
              src={`${imageSrc}`}
              alt={alt || missingALt}
            />
            {/* Load LQIP in foreground */}
            <img
              onLoad={() => {
                this.setState({lqipLoaded: true})
              }}
              style={styles.lqip}
              src={`${imageSrc}`}
              alt={alt || missingALt}
            />
          </React.Fragment>
        ) : null}
      </figure>
    )
  }
}

