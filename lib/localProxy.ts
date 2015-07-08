import {visitSpec, Spec} from 'uservices'
import {Observer, Observable} from 'rx'
import * as s from 'typescript-schema'

export function createLocalProxy<T>(server: SocketIO.Server, serviceSchema: Spec, service: T) {
  server.on('connection', function(socket) {
    visitSpec({
      onPromise: function(memberSchema){
        let name = memberSchema.name
        let func = service[name]
        socket.on(name, function(args: any[], cb: (value?: any, error?: any) => void) {
          (<Promise<any>>func.apply(service, args)).then(cb).catch(cb.bind(null, null))
        })
      },
      onObservable: function(memberSchema){
        let name = memberSchema.name
        let event = service[name]
        socket.on(name, function(args: any[], cb: (id: string) => void) {
          let id = String(Date.now())
          socket.once(name + id, function() {
            (<Observable<any>>event.apply(service, args)).subscribe(
              function(value) {
                socket.emit(name + id, [value])
              },
              function(error) {
                socket.emit(name + id, [null, error])
              },
              function() {
                socket.emit(name + id)
              }
            )
          })
          cb(id)
        })
      }
    }, /*Type Hack*/ <s.Class> serviceSchema)
  })
}
