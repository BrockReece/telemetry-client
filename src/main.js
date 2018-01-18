import { Subject } from 'rxjs'
import jwtDecode from 'jwt-decode'

const telemetryStream = new Subject()

function observeResourcePerformance() {
    performance.getEntriesByType('resource')
        .forEach((resource) => {
            telemetryStream.next({ type: 'resource', ...resource.toJSON() })
        })

    const performanceObserver = new window.PerformanceObserver((list) => {
        list.getEntriesByType('resource')
            .filter(e => e.initiatorType === 'xmlhttprequest')
            .filter(e => e.name.includes('//gateway.'))
            .forEach(resource => telemetryStream.next({ type: 'resource', ...resource.toJSON() }))
    })

    performanceObserver.observe({ entryTypes: ['resource'] })
}

function observeMeasurePerformance() {
    const performanceObserver = new window.PerformanceObserver((list) => {
        list.getEntriesByType('measure')
            .forEach(resource => telemetryStream.next({ type: 'measure', ...resource.toJSON() }))
    })

    performanceObserver.observe({ entryTypes: ['measure'] })
}


const token = jwtDecode(localStorage.getItem('jwt'))
const socket = io('https://telemetry-integration.croud.tech/', {
    transportOptions: {
        polling: {
            extraHeaders: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
        },
    },
})

socket.emit('telemetry', {
    ...window.performance.timing.toJSON(),
    user_id: token.sub,
    type: 'navigation',
})

telemetryStream.subscribe((event) => {
    console.log(event)
    socket.emit('telemetry', {
        ...event,
        user_id: token.sub,
        connection: {
            downlink: navigator.connection.downlink,
            effectiveType: navigator.connection.effectiveType,
            rtt: navigator.connection.rtt,
        },
    })
})

observeResourcePerformance()
observeMeasurePerformance()