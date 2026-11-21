
import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración de la prueba de rendimiento
export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '30s', target: 20 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 0 },
    ],

    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.05'],
    },
};

// Dirección de nuestra API MoviCibao
const BASE_URL = 'http://localhost:3000';

export default function () {

    // Consultar las incidencias registradas
    const response = http.get(`${BASE_URL}/api/incidencias`);

    // Validar la respuesta de la API
    check(response, {
        'Estado HTTP 200': (r) => r.status === 200,
        'Respuesta en formato JSON': (r) =>
            r.headers['Content-Type']?.includes('application/json'),
        'Contiene listado de incidencias': (r) => {
            try {
                const body = r.json();
                return Array.isArray(body.datos);
            } catch (error) {
                return false;
            }
        },
    });

    // Pausa entre solicitudes
    sleep(1);
}
