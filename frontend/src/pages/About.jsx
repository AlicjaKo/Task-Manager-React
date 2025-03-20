import "../styles/About.css"

function About() {
    return (
        <div>
            <div className="about-container">
                <h2>About</h2>

                <h3>Author</h3>
                <p>This app was fully developed by Alicja Kosak.</p>

                <h3>Instructions</h3>
                <p>This app consists of four views: Tasks, Summary, Records, and About.</p>
                <p>Tasks: By pressing "Add task" button user can add a new task, insert name for it, and choose tags from a list of already exising ones, or assign a new one. When an activity is started user should press "start" button, and when the activity is finished, user should press "stop".</p>
                <p>Summary: By choosing a timeline user can see a summary of the task, or a tag.</p>
                <p>Records: By choosing a timeline and name of the task user can see when the chosen task was activated, and deactivated.</p>
                <p>About: Information about the app.</p>

                <h3>Pictures and graphics</h3>
                <p>All pictures were done by Alicja Kosak.</p>

                <h3>AI tools</h3>
                <p>ChatGPT was used during debugging process during creation of this app. It helped in suggesting the possible reasons why an error occurred and what strategies can be used in order to solve it.</p>

                <h3>Workload</h3>
                <p>This app was created in 60 hours.</p>

                <h3>Difficulties</h3>
                <p>The hardest feature was to implement subbmision of the new tags, when the list of existing ones already was available.</p>
            </div>
        </div>
    );
}

    export default About;