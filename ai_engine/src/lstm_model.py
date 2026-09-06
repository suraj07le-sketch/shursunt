import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input, Attention, Bidirectional
from tensorflow.keras.callbacks import EarlyStopping
import numpy as np

class CryptoLSTM:
    def __init__(self, input_shape, mode='classifier'):
        """
        input_shape: (timesteps, features) e.g. (60, 9)
        mode: 'classifier' for direction prediction, 'regressor' for price prediction
        """
        self.input_shape = input_shape
        self.mode = mode
        self.model = self._build_model()

    def _build_model(self):
        inputs = Input(shape=self.input_shape)
        
        # Bidirectional LSTM Layer 1
        x = Bidirectional(LSTM(64, return_sequences=True))(inputs)
        x = Dropout(0.25)(x)
        
        # LSTM Layer 2
        x = LSTM(32, return_sequences=True)(x)
        x = Dropout(0.25)(x)
        
        # Self-Attention
        attention = Attention()([x, x])
        
        # Take last timestep
        last_step = tf.keras.layers.Lambda(lambda t: t[:, -1, :])(attention)
        
        # Dense layers
        x = Dense(32, activation='relu')(last_step)
        x = Dropout(0.2)(x)
        
        if self.mode == 'classifier':
            outputs = Dense(1, activation='sigmoid')(x)
            model = Model(inputs=inputs, outputs=outputs)
            model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        else:
            outputs = Dense(1)(x)
            model = Model(inputs=inputs, outputs=outputs)
            model.compile(optimizer='adam', loss='mse')
        
        return model

    def train(self, X_train, y_train, epochs=20, batch_size=32):
        early_stop = EarlyStopping(monitor='loss', patience=5, restore_best_weights=True)
        self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.1,
            callbacks=[early_stop],
            verbose=0
        )

    def predict(self, X):
        return self.model.predict(X, verbose=0)

    def save(self, filepath):
        self.model.save(filepath)

    def load(self, filepath):
        self.model = tf.keras.models.load_model(filepath)

if __name__ == "__main__":
    # Test classifier mode
    dummy_input = np.random.random((100, 60, 9))
    dummy_target = np.random.randint(0, 2, (100,))
    
    lstm = CryptoLSTM(input_shape=(60, 9), mode='classifier')
    lstm.model.summary()
    lstm.train(dummy_input, dummy_target, epochs=2)
    pred = lstm.predict(dummy_input[:5])
    print("Predictions:", pred.flatten())
