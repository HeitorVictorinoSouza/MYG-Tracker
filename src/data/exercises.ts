export interface ExerciseInfo {
    name: string;
    target: string;
}

export const EXERCISE_DATABASE: ExerciseInfo[] = [
    // Peito
    { name: 'Supino Reto com Barra', target: 'Peito' },
    { name: 'Supino Inclinado com Barra', target: 'Peito' },
    { name: 'Supino Declinado', target: 'Peito' },
    { name: 'Supino Reto com Halteres', target: 'Peito' },
    { name: 'Supino Inclinado com Halteres', target: 'Peito' },
    { name: 'Crucifixo Reto', target: 'Peito' },
    { name: 'Crucifixo Inclinado', target: 'Peito' },
    { name: 'Crossover (Polia Alta)', target: 'Peito' },
    { name: 'Crossover (Polia Baixa)', target: 'Peito' },
    { name: 'Peck Deck (Voador)', target: 'Peito' },
    { name: 'Flexão de Braço', target: 'Peito' },
    { name: 'Paralelas (Foco Peito)', target: 'Peito' },
    { name: 'Pullover', target: 'Peito' },

    // Costas
    { name: 'Puxada Aberta (Frente)', target: 'Costas' },
    { name: 'Puxada Fechada (Triângulo)', target: 'Costas' },
    { name: 'Puxada Articulada', target: 'Costas' },
    { name: 'Remada Curvada com Barra', target: 'Costas' },
    { name: 'Remada Curvada com Halteres', target: 'Costas' },
    { name: 'Remada Unilateral (Serrote)', target: 'Costas' },
    { name: 'Remada Baixa (Triângulo)', target: 'Costas' },
    { name: 'Remada Cavalinho', target: 'Costas' },
    { name: 'Remada Máquina', target: 'Costas' },
    { name: 'Crucifixo Inverso (Máquina/Halter)', target: 'Costas' },
    { name: 'Barra Fixa (Pronada)', target: 'Costas' },
    { name: 'Barra Fixa (Supinada)', target: 'Costas' },
    { name: 'Levantamento Terra', target: 'Costas' },
    { name: 'Pulldown', target: 'Costas' },
    { name: 'Lombar no Banco', target: 'Costas' },

    // Pernas
    { name: 'Agachamento Livre', target: 'Pernas' },
    { name: 'Agachamento no Smith', target: 'Pernas' },
    { name: 'Agachamento Búlgaro', target: 'Pernas' },
    { name: 'Agachamento Hack', target: 'Pernas' },
    { name: 'Agachamento Sumô', target: 'Pernas' },
    { name: 'Leg Press 45º', target: 'Pernas' },
    { name: 'Leg Press Horizontal', target: 'Pernas' },
    { name: 'Cadeira Extensora', target: 'Pernas' },
    { name: 'Cadeira Flexora', target: 'Pernas' },
    { name: 'Mesa Flexora', target: 'Pernas' },
    { name: 'Stiff', target: 'Pernas' },
    { name: 'Levantamento Terra Romeno (RDL)', target: 'Pernas' },
    { name: 'Avanço / Passada', target: 'Pernas' },
    { name: 'Elevação Pélvica', target: 'Pernas' },
    { name: 'Cadeira Abdutora', target: 'Pernas' },
    { name: 'Cadeira Adutora', target: 'Pernas' },
    { name: 'Panturrilha em Pé', target: 'Pernas' },
    { name: 'Panturrilha Sentado (Máquina)', target: 'Pernas' },
    { name: 'Panturrilha no Leg Press', target: 'Pernas' },

    // Ombros
    { name: 'Desenvolvimento com Barra', target: 'Ombros' },
    { name: 'Desenvolvimento com Halteres', target: 'Ombros' },
    { name: 'Desenvolvimento Máquina / Arnold', target: 'Ombros' },
    { name: 'Elevação Lateral com Halteres', target: 'Ombros' },
    { name: 'Elevação Lateral na Polia', target: 'Ombros' },
    { name: 'Elevação Frontal', target: 'Ombros' },
    { name: 'Encolhimento com Barra', target: 'Ombros' },
    { name: 'Encolhimento com Halteres', target: 'Ombros' },
    { name: 'Remada Alta', target: 'Ombros' },
    { name: 'Crucifixo Inverso (Polia)', target: 'Ombros' },

    // Braços
    { name: 'Rosca Direta com Barra', target: 'Braços' },
    { name: 'Rosca Direta com Halteres', target: 'Braços' },
    { name: 'Rosca Alternada', target: 'Braços' },
    { name: 'Rosca Martelo', target: 'Braços' },
    { name: 'Rosca Scott (Máquina/Barra)', target: 'Braços' },
    { name: 'Rosca Concentrada', target: 'Braços' },
    { name: 'Rosca na Polia Baixa', target: 'Braços' },
    { name: 'Tríceps Testa', target: 'Braços' },
    { name: 'Tríceps Pulley (Barra)', target: 'Braços' },
    { name: 'Tríceps Pulley (Corda)', target: 'Braços' },
    { name: 'Tríceps Francês', target: 'Braços' },
    { name: 'Tríceps Coice', target: 'Braços' },
    { name: 'Tríceps Banco', target: 'Braços' },
    { name: 'Mergulho nas Paralelas', target: 'Braços' },
    { name: 'Rosca Inversa (Antebraço)', target: 'Braços' },
    { name: 'Flexão de Punho (Antebraço)', target: 'Braços' },

    // Core
    { name: 'Abdominal Supra (Tradicional)', target: 'Core' },
    { name: 'Abdominal Infra', target: 'Core' },
    { name: 'Abdominal na Polia', target: 'Core' },
    { name: 'Abdominal Máquina', target: 'Core' },
    { name: 'Prancha Isométrica', target: 'Core' },
    { name: 'Elevação de Pernas Suspenso', target: 'Core' },
    { name: 'Abdominal Oblíquo', target: 'Core' },
    { name: 'Giro Russo (Russian Twist)', target: 'Core' },
    { name: 'Roda Abdominal (Ab Wheel)', target: 'Core' },
    { name: 'Lombar no Banco', target: 'Core' },

    // Cardio
    { name: 'Esteira', target: 'Cardio' },
    { name: 'Bicicleta Ergométrica', target: 'Cardio' },
    { name: 'Elíptico', target: 'Cardio' },
    { name: 'Simulador de Escada', target: 'Cardio' },
    { name: 'Pular Corda', target: 'Cardio' }
].sort((a, b) => a.name.localeCompare(b.name));
