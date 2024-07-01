import os
from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)

# Slot machine configuration
symbol_sets = {
    'Default': ['🍒', '🍋', '🍀', '♠', '7'],
    'Cards - Ace to 10': ['A', 'K', 'Q', 'J', '10'],
    'Special Symbols': ['@', '#', '%', '&', '$'],
    'Letters': ['AA', 'GG', 'OO', 'NN', 'WW']
}
symbols = symbol_sets['Default']

# Game state
budget = 0.0
bet = 0.0
initial_budget = 0.0
spin_counter = 0
auto_spin_count = 0
auto_spin_active = False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/set_budget_bet', methods=['POST'])
def set_budget_bet():
    global budget, bet, initial_budget
    data = request.get_json()
    budget = float(data['budget'])
    bet = float(data['bet'])
    initial_budget = budget
    return jsonify(success=True)

@app.route('/spin', methods=['POST'])
def spin():
    global budget, bet, spin_counter, auto_spin_count, auto_spin_active
    if budget < bet:
        return jsonify(success=False, message="Not enough budget to place the bet.")
    
    budget -= bet
    spin_counter += 1
    
    # Simulate the spin
    columns = []
    for i in range(5):
        col = [random.choice(symbols) for _ in range(5)]
        columns.append(col)
    
    # Check for win (simplified)
    win = check_win(columns)
    budget += win
    
    if auto_spin_active and auto_spin_count > 0:
        auto_spin_count -= 1
        if auto_spin_count == 0:
            auto_spin_active = False
    
    return jsonify(success=True, columns=columns, win=win, budget=budget, spin_counter=spin_counter, auto_spin_active=auto_spin_active)

def check_win(columns):
    win = 0
    middle_row = [columns[i][2] for i in range(5)]
    
    # Simplified win check
    if len(set(middle_row)) == 1:
        win = bet * 10
    elif len(set(middle_row)) == 2:
        win = bet * 5
    return win

@app.route('/auto_spin', methods=['POST'])
def auto_spin():
    global auto_spin_count, auto_spin_active
    data = request.get_json()
    auto_spin_count = int(data['count'])
    auto_spin_active = True
    return jsonify(success=True, auto_spin_count=auto_spin_count)

@app.route('/cancel_auto_spin', methods=['POST'])
def cancel_auto_spin():
    global auto_spin_count, auto_spin_active
    auto_spin_count = 0
    auto_spin_active = False
    return jsonify(success=True)

if __name__ == '__main__':
    app.run(debug=True)
