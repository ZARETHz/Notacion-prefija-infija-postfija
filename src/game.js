
class NotacionConverter {
    constructor() {
        this.precedencia = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '^': 3
        };
    }

    esOperando = (token) => {
        return /^[a-zA-Z0-9.]+$/.test(token);
    }

    mayorOIgualPrecedencia = (op1, op2) => {
        return this.precedencia[op1] >= this.precedencia[op2];
    }

    infijaAPostfija(infija) {
       
        const pila = [];
        let postfija = [];
        const tokens = infija.match(/[a-zA-Z0-9.]+|\(|\)|\+|\-|\*|\/|\^/g) || [];

        for (const token of tokens) {
            if (this.esOperando(token)) {
                postfija.push(token);
            } else if (token === '(') {
                pila.push(token);
            } else if (token === ')') {
                while (pila.length > 0 && pila[pila.length - 1] !== '(') {
                    postfija.push(pila.pop());
                }
                if (pila.length > 0) pila.pop();
                else throw new Error("Paréntesis desbalanceados.");
            } else {
                while (
                    pila.length > 0 &&
                    pila[pila.length - 1] !== '(' &&
                    this.mayorOIgualPrecedencia(pila[pila.length - 1], token)
                ) {
                    postfija.push(pila.pop());
                }
                pila.push(token);
            }
        }
        while (pila.length > 0) {
            if (pila[pila.length - 1] === '(') throw new Error("Paréntesis desbalanceados.");
            postfija.push(pila.pop());
        }
        return postfija.join(' ');
    }

    infijaAPrefija(infija) {
      
        const infijaReversa = infija
            .split('')
            .reverse()
            .map(char => {
                if (char === '(') return ')';
                if (char === ')') return '(';
                return char;
            })
            .join('');

        const postfijaInvertida = this.infijaAPostfija(infijaReversa);
        return postfijaInvertida.split(' ').reverse().join(' ');
    }
    
    /**
     * 
     * @param {string} postfija 
     * @returns {number} 
     */
    evaluarPostfija = (postfija) => {
        const pila = [];
        const tokens = postfija.split(' ').filter(t => t); 

        for (const token of tokens) {
            if (this.esOperando(token) && !isNaN(parseFloat(token))) {
                pila.push(parseFloat(token));
            } else if (token.match(/[\+\-\*\/]/)) {
                if (pila.length < 2) {
                    throw new Error("Expresión postfija inválida (operadores sin suficientes operandos).");
                }
                const op2 = pila.pop(); 
                const op1 = pila.pop();
                let resultado = 0;

                switch (token) {
                    case '+': resultado = op1 + op2; break;
                    case '-': resultado = op1 - op2; break;
                    case '*': resultado = op1 * op2; break;
                    case '/': 
                        if (op2 === 0) throw new Error("División por cero.");
                        resultado = op1 / op2; 
                        break;
                    default: 
                        throw new Error(`Operador desconocido: ${token}`);
                }
                pila.push(resultado);
            } else if (!this.esOperando(token)) {
                 throw new Error(`Operando no numérico o símbolo no soportado: ${token}. Solo se permiten números.`);
            }
        }

        if (pila.length !== 1) {
            throw new Error("Expresión postfija incompleta o mal formada.");
        }
        return pila[0];
    }
}

const conversor = new NotacionConverter();

const parcheVisualizacionNumeros = (prefijaCalculada, infijaLimpia) => {
    const numerosOriginales = infijaLimpia.match(/[0-9]+/g) || [];
    
    let numIdx = 0;
    const tokensCorregidos = prefijaCalculada.split(' ').map(token => {
        if (token.match(/^[0-9]+$/) && numIdx < numerosOriginales.length) {
            const correctedToken = numerosOriginales[numIdx];
            numIdx++;
            return correctedToken;
        }
        return token;
    });

    return tokensCorregidos.join(' ');
}

const procesarOperacion = () => {
    const operacionInput = document.getElementById('operacionInput');
    const resultadoOutput = document.getElementById('resultadoOutput');
    const expresion = operacionInput.value.trim();

    if (!expresion) {
        Swal.fire('Atención', 'Por favor, ingresa una operación válida.', 'warning');
        resultadoOutput.textContent = "Aquí se mostrarán los resultados...";
        return;
    }

    const notacionFijaLimpia = expresion.replace(/\s+/g, '');

    try {
        let resultados = {};
        let resultadoEvaluacion = null;

        let inicio = performance.now();
        const notacionPostfija = conversor.infijaAPostfija(notacionFijaLimpia);
        resultados.postfija = {
            notacion: notacionPostfija,
            tiempo: (performance.now() - inicio) / 1000
        };
        
        resultadoEvaluacion = conversor.evaluarPostfija(notacionPostfija);

        inicio = performance.now();
        let prefijaCalculada = conversor.infijaAPrefija(notacionFijaLimpia);
        let fin = performance.now();
        
        let prefijaCorregida = parcheVisualizacionNumeros(prefijaCalculada, notacionFijaLimpia);

        resultados.prefija = { 
            notacion: prefijaCorregida, 
            tiempo: (fin - inicio) / 1000 
        };
        
        const salida = `


Operación ingresada: ${expresion}
Resultado de la Operación: ${resultadoEvaluacion}

notacion fija: ${notacionFijaLimpia} (Tiempo: 0.000000 segundos)
notacion prefija: ${resultados.prefija.notacion} (Tiempo: ${resultados.prefija.tiempo.toFixed(6)} segundos)
notacion postfija: ${resultados.postfija.notacion} (Tiempo: ${resultados.postfija.tiempo.toFixed(6)} segundos)

        `.trim();

        resultadoOutput.textContent = salida;

    } catch (error) {
        Swal.fire('Error de Cálculo', error.message, 'error');
        resultadoOutput.textContent = `Error al procesar la expresión: ${error.message}`;
    }
}