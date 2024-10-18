import tkinter as tk
from tkinter import messagebox, Menu, simpledialog, colorchooser
import random


class SlotMachine:
    def __init__(self, root):
        self.spin_button = None
        self.slot_labels = None
        self.message_label = None
        self.history_data = []
        self.history_table = None
        self.frame = None
        self.root = root
        self.root.title("Slots Machine")
        self.root.geometry("1635x1111")  # Increased window size to fit history table
        self.root.resizable(False, False)  # Not allowing window resizing

        self.symbol_sets = {
            'Default': ['🍒', '🍋', '🍀', '♠', '7'],
            'Cards - Ace to 10': ['A', 'K', 'Q', 'J', '10'],
            'Special Symbols': ['@', '#', '%', '&', '$'],
            'Letters': ['AA', 'GG', 'OO', 'NN', 'WW']
        }
        self.symbols = self.symbol_sets['Default']
        self.budget = 0.0
        self.bet = 0.0
        self.initial_budget = 0.0
        self.spin_counter = 0
        self.auto_spin_count = 0
        self.auto_spin_active = False
        self.create_menu()
        self.create_widgets()
        self.setup_bindings()

    def create_menu(self):
        menu = Menu(self.root)
        self.root.config(menu=menu)

        file_menu = Menu(menu, tearoff=0)
        menu.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="New Game", command=self.new_game)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)

        settings_menu = Menu(menu, tearoff=0)
        menu.add_cascade(label="Settings", menu=settings_menu)
        symbols_menu = Menu(settings_menu, tearoff=0)
        settings_menu.add_cascade(label="Change Symbols", menu=symbols_menu)
        for name in self.symbol_sets:
            symbols_menu.add_command(label=name, command=lambda n=name: self.change_symbols(n))
        settings_menu.add_command(label="Change Background Color", command=self.change_background_color)

        help_menu = Menu(menu, tearoff=0)
        menu.add_cascade(label="Help", menu=help_menu)
        help_menu.add_command(label="About", command=lambda: messagebox.showinfo("About", "Slots Machine Game\nCreated by Atanas Yourdanov"))

    def create_widgets(self):
        self.frame = tk.Frame(self.root, bg='darkgreen')
        self.frame.pack(padx=20, pady=20, fill=tk.BOTH, expand=True)

        self.slot_labels = []
        for i in range(5):  # 5 columns
            col = []
            for j in range(5):  # 5 rows, including top and bottom rows
                bg_color = 'yellow' if j == 2 else 'darkgreen'  # Highlight the middle row
                fg_color = 'black' if j == 2 else 'white'  # Use black text color for the middle row
                label = tk.Label(self.frame, text="", font=("Helvetica", 36, 'bold'), bg=bg_color, fg=fg_color,
                                 relief='sunken', width=5)
                label.grid(row=j, column=i, padx=10, pady=10)
                col.append(label)
            self.slot_labels.append(col)

        self.spin_button = tk.Button(self.frame, text="Spin! (Space)", command=self.spin, bg='red', fg='white',
                                     font=("Helvetica", 16, 'bold'))
        self.spin_button.grid(row=6, column=1, columnspan=1, pady=10)

        self.change_bet_button = tk.Button(self.frame, text="Change Bet!", command=self.ask_for_bet, bg='blue',
                                           fg='white', font=("Helvetica", 14, 'bold'))
        self.change_bet_button.grid(row=7, column=2, columnspan=1, pady=10)

        self.auto_spin_button = tk.Button(self.frame, text="Auto Spin!", command=self.auto_spin_setup, bg='purple',
                                          fg='white', font=("Helvetica", 14, 'bold'))
        self.auto_spin_button.grid(row=6, column=2, columnspan=1, pady=20)

        self.cancel_auto_spin_button = tk.Button(self.frame, text="Cancel Auto Spin!", command=self.cancel_auto_spin,
                                                 bg='orange', fg='white', font=("Helvetica", 14, 'bold'))
        self.cancel_auto_spin_button.grid(row=6, column=3, columnspan=1, pady=20)
        self.cancel_auto_spin_button.grid_remove()

        self.spin_counter_label = tk.Label(self.frame, text=f"Spin Count: {self.spin_counter}", bg='darkgreen',
                                           fg='white', font=("Helvetica", 14, 'bold'))
        self.spin_counter_label.grid(row=8, column=1, columnspan=1, pady=10)

        self.auto_spin_counter_label = tk.Label(self.frame, text=f"Auto Spin Count: {self.auto_spin_count}",
                                                bg='darkgreen', fg='white', font=("Helvetica", 14, 'bold'))
        self.auto_spin_counter_label.grid(row=8, column=2, columnspan=1, pady=10)

        self.budget_label = tk.Label(self.frame, text=f"Budget: {self.budget:.2f}", bg='darkgreen', fg='white',
                                     font=("Helvetica", 14, 'bold'))
        self.budget_label.grid(row=8, column=3, columnspan=1, pady=10)

        self.bet_label = tk.Label(self.frame, text=f"Current Bet: {self.bet:.2f}", bg='darkgreen', fg='white',
                                  font=("Helvetica", 14, 'bold'))
        self.bet_label.grid(row=8, column=4, columnspan=1, pady=10)

        self.message_label = tk.Label(self.frame, text="", bg='darkgreen', fg='yellow', font=("Helvetica", 14, 'bold'))
        self.message_label.grid(row=9, column=1, columnspan=3, pady=10)

        self.budget_entry = tk.Entry(self.frame, font=("Helvetica", 14, 'bold'))
        self.budget_entry.grid(row=0, column=1, columnspan=2, pady=10)
        self.budget_entry.insert(0, "Enter budget")

        self.bet_entry = tk.Entry(self.frame, font=("Helvetica", 14, 'bold'))
        self.bet_entry.grid(row=0, column=3, columnspan=2, pady=10)
        self.bet_entry.insert(0, "Enter bet")

        self.set_budget_bet_button = tk.Button(self.frame, text="Set Budget & Bet", command=self.set_budget_bet,
                                               bg='green', fg='white', font=("Helvetica", 14, 'bold'))
        self.set_budget_bet_button.grid(row=0, column=5, pady=10)

        # Create history table
        self.history_table = []
        history_frame = tk.Frame(self.frame, bg='darkgreen')
        history_frame.grid(row=0, column=6, rowspan=10, padx=10)

        headers = ["Spin#", "Symbols", "Win Amount", "Win Type"]
        for col, header in enumerate(headers):
            header_label = tk.Label(history_frame, text=header, font=("Helvetica", 12, 'bold'),
                                    bg='darkgreen', fg='white', relief='raised', width=15)
            header_label.grid(row=0, column=col, padx=5, pady=5)

        for row in range(1, 31):  # Create 30 rows for history
            row_labels = []
            for col in range(4):
                label = tk.Label(history_frame, text="", font=("Helvetica", 12), bg='darkgreen', fg='white', width=15, relief='sunken')
                label.grid(row=row, column=col, padx=5, pady=5)
                row_labels.append(label)
            self.history_table.append(row_labels)

    def setup_bindings(self):
        self.root.bind('<Return>',
                       lambda e: self.set_budget_bet() if self.budget_entry.get().isdigit() else self.ask_for_bet())
        self.root.bind('<space>', lambda e: self.spin())

    def set_budget_bet(self):
        try:
            self.budget = float(self.budget_entry.get())
            self.bet = float(self.bet_entry.get())
            self.initial_budget = self.budget
            if self.budget <= 0 or self.bet <= 0:
                raise ValueError
            if self.budget > 100000000000:
                self.message_label.config(text="Budget cannot be larger than 100 billion.")
                return
            if self.bet > self.budget * 0.3:
                self.message_label.config(text="Bet cannot be larger than 30% of the budget.")
                return
        except ValueError:
            self.message_label.config(text="Please enter valid budget and bet amounts.")
            return

        self.budget_entry.grid_remove()
        self.bet_entry.grid_remove()
        self.set_budget_bet_button.grid_remove()
        self.update_budget_label()
        self.update_bet_label()
        self.message_label.config(text="Budget and Bet are set!")
        self.budget_entry.focus_set()

    def ask_for_bet(self):
        self.bet_entry.grid()
        self.set_budget_bet_button.config(command=self.update_bet)
        self.set_budget_bet_button.grid()
        self.bet_entry.delete(0, tk.END)
        self.bet_entry.insert(0, f"{self.bet:.2f}")
        self.bet_entry.focus_set()

    def update_bet(self):
        try:
            new_bet = float(self.bet_entry.get())
            if new_bet <= 0 or new_bet > self.budget:
                raise ValueError
            self.bet = new_bet
        except ValueError:
            self.message_label.config(text="Please enter a valid bet amount.")
            return

        self.bet_entry.grid_remove()
        self.set_budget_bet_button.grid_remove()
        self.message_label.config(text="Bet is updated!")
        self.update_bet_label()

    def spin(self):
        if self.budget < self.bet:
            self.message_label.config(text="Not enough budget to place the bet.")
            return

        self.spin_button.config(state='disabled')
        self.change_bet_button.config(state='disabled')
        self.auto_spin_button.config(state='disabled')
        self.cancel_auto_spin_button.config(state='disabled')
        self.budget -= self.bet
        self.message_label.config(text="")
        self.spin_counter += 1
        self.spin_counter_label.config(text=f"Spin Count: {self.spin_counter}")

        self.animate_spin()

    def animate_spin(self):
        self.spinning = True
        columns = []
        for _ in range(20):  # Number of "spins" for the animation
            for i in range(5):  # 5 columns
                col = []
                for j in range(5):  # 5 rows, including top and bottom rows
                    symbol = random.choice(self.symbols)
                    self.slot_labels[i][j].config(text=symbol)
                    if _ == 19:
                        col.append(symbol)
                if _ == 19:
                    columns.append(col)
            self.root.update()
            self.root.after(100)  # Time delay for the spin effect

        # Define fixed delays for the first four columns and a random delay for the fifth column
        delays = [200, 300, 400, 500, random.randint(600, 700)]

        # Schedule each column's stop time
        for i, delay in enumerate(delays):
            self.root.after(delay, self.update_column, i, columns[i])

        # Schedule the win check and re-enable buttons after the last column stops spinning
        self.root.after(max(delays) + 100, self.finish_spin, columns)

    def update_column(self, col_idx, symbols):
        for j in range(5):
            self.slot_labels[col_idx][j].config(text=symbols[j])
        self.root.update()

    def finish_spin(self, columns):
        win = self.check_win(columns)
        self.update_budget_label()
        self.spinning = False

        if self.budget <= 0:
            self.message_label.config(text="You have run out of budget. Game over!")
            self.disable_all_buttons()
            return

        if self.auto_spin_active and self.auto_spin_count > 0:
            self.root.after(500, self.auto_spin)  # 500 ms delay before the next auto spin
        else:
            self.enable_all_buttons()
            self.auto_spin_active = False

        if win > 0:
            self.update_history(self.spin_counter, columns, win)

    def check_win(self, columns):
        win = 0
        middle_row = [columns[i][2] for i in range(5)]  # Middle row is the 3rd row (index 2)

        # Five of a Kind: All five symbols are the same
        if middle_row[0] == middle_row[1] == middle_row[2] == middle_row[3] == middle_row[4]:
            win += self.bet * 10
            self.budget += win
            self.display_win(win, "Five of a Kind")
            return win

        # Four of a Kind
        if any(middle_row.count(symbol) == 4 for symbol in set(middle_row)):
            win += self.bet * 3.5
            self.budget += win
            self.display_win(win, "Four of a Kind")
            return win

        # Full House: 2 symbols of one kind and 3 symbols of another kind
        unique_symbols = list(set(middle_row))
        if len(unique_symbols) == 2:
            count1 = middle_row.count(unique_symbols[0])
            count2 = middle_row.count(unique_symbols[1])
            if (count1 == 2 and count2 == 3) or (count1 == 3 and count2 == 2):
                win += self.bet * 3.2
                self.budget += win
                self.display_win(win, "Full House")
                return win

        # Three of a Kind next to each other
        for i in range(3):
            if middle_row[i] == middle_row[i + 1] == middle_row[i + 2]:
                win += self.bet * 1.8
                self.budget += win
                self.display_win(win, "Three of a Kind")
                return win

        # Special ordered sequences
        special_sequences = [
            ['🍋', '🍀', '♠', '🍒', '7'],
            ['10', 'J', 'Q', 'K', 'A'],
            ['@', '#', '$', '%', '&'],
            ['AA', 'GG', 'NN', 'OO', 'WW']
        ]
        if middle_row in special_sequences:
            win += self.bet * 4.5
            self.budget += win
            self.display_win(win, "Special Sequence")
            return win

        # Four consecutive symbols
        if (middle_row[0] == middle_row[1] == middle_row[2] == middle_row[3]) or (
                middle_row[1] == middle_row[2] == middle_row[3] == middle_row[4]):
            win += self.bet * 4
            self.budget += win
            self.display_win(win, "Four Consecutive Symbols")
            return win

        # Counting the symbols in the middle row
        symbol_counts = {symbol: middle_row.count(symbol) for symbol in set(middle_row)}

        # Two pairs of same symbols next to each other
        pairs_adjacent = [symbol for symbol, count in symbol_counts.items() if
                          count == 2 and any(middle_row[i] == middle_row[i + 1] == symbol for i in range(4))]
        if len(pairs_adjacent) == 2:
            win += self.bet * 1.6
            self.budget += win
            self.display_win(win, "Adjacent Two Pairs")
            return win

        # Two pairs of same symbols not next to each other
        pairs_non_adjacent = [symbol for symbol, count in symbol_counts.items() if count == 2]
        if len(pairs_non_adjacent) == 2 and len(pairs_adjacent) != 2:
            win += self.bet * 1.3
            self.budget += win
            self.display_win(win, "Non-adjacent Two Pairs")
            return win

        # One pair
        if len(pairs_non_adjacent) == 1:
            win += self.bet * 1.1
            self.budget += win
            self.display_win(win, "One Pair")
            return win

        return win

    def display_win(self, win, condition):
        self.message_label.config(text=f"You won: {win:.2f} ({condition})")

    def update_history(self, spin_number, columns, win):
        middle_row = [columns[i][2] for i in range(5)]  # Extract the middle row symbols

        # Prepare data for history
        symbols = " ".join(middle_row)
        win_type = self.message_label.cget("text").split("(")[-1][:-1]  # Extract the win type from message label
        win_amount = f"{win:.2f}"

        # Insert into history and handle rolling logic
        if len(self.history_data) >= 30:  # Remove the oldest entry if we exceed 30
            self.history_data.pop(0)

        self.history_data.append([spin_number, symbols, win_amount, win_type])

        # Update the table
        for i, data in enumerate(self.history_data):
            self.history_table[i][0].config(text=data[0])
            self.history_table[i][1].config(text=data[1])
            self.history_table[i][2].config(text=data[2])
            self.history_table[i][3].config(text=data[3])

    def auto_spin_setup(self):
        try:
            spin_count = self.ask_for_spin_count()
            if spin_count is None:
                return
            self.auto_spin_count = spin_count
            if self.auto_spin_count > 0:
                self.disable_all_buttons()
                self.auto_spin_counter_label.config(text=f"Auto Spin Count: {self.auto_spin_count}")
                self.auto_spin_active = True
                self.auto_spin()
        except ValueError:
            self.message_label.config(text="Invalid input for auto spin count.")

    def cancel_auto_spin(self):
        self.auto_spin_active = False
        self.auto_spin_count = 0
        self.cancel_auto_spin_button.grid_remove()
        self.enable_all_buttons()

    def ask_for_spin_count(self):
        try:
            spin_count = simpledialog.askinteger("Auto Spin", "Enter number of spins:")
            if spin_count is None or spin_count <= 0:
                raise ValueError
            return spin_count
        except ValueError:
            self.message_label.config(text="Invalid input for spin count. Please enter a positive integer.")
            return None

    def change_background_color(self):
        color = colorchooser.askcolor()[1]
        if color:
            self.frame.config(bg=color)
            for i in range(5):
                for j in range(5):
                    self.slot_labels[i][j].config(bg=color if j != 2 else 'yellow')

    def auto_spin(self):
        if self.auto_spin_active and self.auto_spin_count > 0 and self.budget >= self.bet:
            self.budget -= self.bet
            self.spin_counter += 1
            self.spin_counter_label.config(text=f"Spin Count: {self.spin_counter}")
            self.animate_spin()
            self.auto_spin_count -= 1
            self.auto_spin_counter_label.config(text=f"Auto Spin Count: {self.auto_spin_count}")
        else:
            self.cancel_auto_spin()

    def disable_all_buttons(self):
        self.spin_button.config(state='disabled')
        self.change_bet_button.config(state='disabled')
        self.auto_spin_button.config(state='disabled')
        self.cancel_auto_spin_button.grid()
        self.cancel_auto_spin_button.config(state='normal')

    def enable_all_buttons(self):
        self.spin_button.config(state='normal')
        self.change_bet_button.config(state='normal')
        self.auto_spin_button.config(state='normal')
        self.cancel_auto_spin_button.grid_remove()

    def update_budget_label(self):
        self.budget_label.config(text=f"Budget: {self.budget:.2f}")

    def update_bet_label(self):
        self.bet_label.config(text=f"Current Bet: {self.bet:.2f}")

    def new_game(self):
        self.budget = 0.0
        self.bet = 0.0
        self.spin_counter = 0
        self.history_data = []  # Clear history
        for row in self.history_table:  # Clear table
            for label in row:
                label.config(text="")

        self.spin_counter_label.config(text=f"Spin Count: {self.spin_counter}")
        self.update_budget_label()
        self.update_bet_label()
        self.budget_entry.grid()
        self.bet_entry.grid()
        self.set_budget_bet_button.grid()
        self.change_bet_button.config(state='normal')
        self.spin_button.config(state='normal')
        self.message_label.config(text="")
        self.budget_entry.focus_set()

    def change_symbols(self, name):
        self.symbols = self.symbol_sets[name]
        self.new_game()


if __name__ == "__main__":
    root = tk.Tk()
    slot_machine = SlotMachine(root)
    root.mainloop()
