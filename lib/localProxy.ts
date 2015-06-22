import {Spec, Observable, splitService} from 'uservices'
import {Observer} from 'rx'

export function createLocalProxy<T>(server: SocketIO.Server, spec: Spec<T>, service: T) {
  let split = splitService(spec, service)

  server.on('connection', function(socket) {
    split.visit(function(name, action) {
      socket.on(name, action)
    }, function(name, func) {
      socket.on(name, function(args: any[], cb: (value?: any, error?: any) => void) {
        (<Promise<any>>func.apply(service, args)).then(cb).catch(cb.bind(null, null))
      })
    }, function(name, event) {
      socket.on(name, function(args: any[], cb: (id: string) => void) {
        let id = String(Date.now())
        socket.once(name + id, function() {
          (<Observable<any>>event.apply(service, args)).subscribe({
            onNext: function(value) {
              socket.emit(name + id, [value])
            },
            onError: function(error) {
              socket.emit(name + id, [null, error])
            },
            onCompleted: function() {
              socket.emit(name + id)
            }
          })
        })
        cb(id)
      })
    })
  })
}
