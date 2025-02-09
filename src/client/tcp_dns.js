const net = require('net')
const tls = require('tls');
const dns = require('dns')

module.exports = function (client, options) {
  // Default options
  options.port = options.port || 25565
  options.host = options.host || 'localhost'

  if (!options.connect) {
    options.connect = (client) => {
      // Use stream if provided
      if (options.stream) {
        client.setSocket(options.stream)
        client.emit('connect')
        return
      }

      // If port was not defined (defauls to 25565), host is not an ip neither localhost
      if (options.port === 25565 && net.isIP(options.host) === 0 && options.host !== 'localhost') {
        // Try to resolve SRV records for the comain
        dns.resolveSrv('_minecraft._tcp.' + options.host, (err, addresses) => {
          // Error resolving domain
          if (err) {
            // Could not resolve SRV lookup, connect directly
            client.setSocket(options.tlsOptions ? tls.connect(options.port, options.host, options.tlsOptions) : net.connect(options.port, options.host))
            return
          }

          // SRV Lookup resolved conrrectly
          if (addresses && addresses.length > 0) {
            options.host = addresses[0].name
            options.port = addresses[0].port
            client.setSocket(options.tlsOptions ? tls.connect(addresses[0].port, addresses[0].name, options.tlsOptions) : net.connect(addresses[0].port, addresses[0].name))
          } else {
            // Otherwise, just connect using the provided hostname and port
            client.setSocket(options.tlsOptions ? tls.connect(options.port, options.host, options.tlsOptions) : net.connect(options.port, options.host))
          }
        })
      } else {
        // Otherwise, just connect using the provided hostname and port
        client.setSocket(options.tlsOptions ? tls.connect(options.port, options.host, options.tlsOptions) : net.connect(options.port, options.host))
      }
    }
  }
}
