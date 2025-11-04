/**
 * A simple logger class for styled console messages.
 * This is useful for debugging and tracking application flow.
 */
class Logger {
  private getTimestamp = (): string => new Date().toISOString();

  private log = (message: string, color: string): void => {
    console.log(
      `%c[${this.getTimestamp()}] ${message}`,
      `color: ${color}; font-weight: bold;`
    );
  };

  public info = (message: string): void => this.log(`INFO: ${message}`, 'deepskyblue');
  public success = (message: string): void => this.log(`SUCCESS: ${message}`, 'mediumseagreen');
  public error = (message: string, errorObj?: any): void => {
    const errorMessage = errorObj ? `${message} - ${errorObj.message}` : message;
    this.log(`ERROR: ${errorMessage}`, 'crimson');
  };
}

// Export a singleton instance so the same logger is used everywhere
export const logger = new Logger();