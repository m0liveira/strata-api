<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

</div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/m0liveira/strata-api">
    <img src="./strata-api/assets/images/strata-logo.png" alt="Strata Logo" width="80" height="80">
  </a>

  <h3 align="center">Strata</h3>

  <p align="center">
    An awesome API that powers Strata app!
    <br />
    <a href="https://github.com/m0liveira/strata-api"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/m0liveira/strata-api">View Demo</a>
    &middot;
    <a href="https://github.com/m0liveira/strata-api/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/m0liveira/strata-api/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#case-study">Case Study</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![App Cover Screen][product-cover]]()

Planning a group trip usually ends in chaos. We needed a backend solution to centralize everything in one place, so we created this Trip Planner API.

The goal of this project is simple:

- Stop using spreadsheets and losing links in group chats.

- Keep everything synced in real time between trip members, from itineraries to expenses.

- Have a solid and fast NestJS foundation to power the upcoming mobile app.

The code is flexible. It works for a solo weekend getaway or a long expedition with dozens of planned locations. Feel free to explore the endpoints, fork the repo, or open a pull request with improvements.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

<div align="center">

[![Nest][NestJS]][NestJS-url]
[![Prisma][Prisma]][Prisma-url]
[![PostgreSQL][PostgreSQL]][PostgreSQL-url]
[![Supabase][Supabase]][Supabase-url]
[![TypeScript][TypeScript]][TypeScript-url]
[![Swagger][Swagger]][Swagger-url]
[![Jest][Jest]][Jest-url]

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

You need Node.js and npm installed on your machine.

###### npm

```sh
  npm install npm@latest -g
```

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/m0liveira/strata-api.git
   ```

2. Install NPM packages

   ```sh
   npm install
   ```

3. Create a .env file in the strata-api root directory and add your environment variables

   ```sh
   DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"
   SUPABASE_URL="[https://your-project.supabase.co](https://your-project.supabase.co)"
   SUPABASE_KEY="your-anon-public-key"
   JWT_SECRET="your-jwt-secret-key"
   ```

4. Run Prisma migrations to set up the database schema

   ```sh
   npx prisma migrate dev;
   ```

5. Start the development server

   ```sh
   npm run start:dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

[![App Cover Screen 2][product-cover2]]()

### API Documentation

The interactive API documentation is available via Swagger. With a running server, access: `http://localhost:3000/api/docs#/`

### WebSockets

- **Base URL**: `ws://localhost:3000`

- **Emit (Client > Server)**:
  - `joinTrip`: `{ "tripId": "uuid" }`

  - `message`: `{ "tripId": "uuid", "message": "text" }`

- **Listen (Server > Client)**:
  - `syncNeeded`: Triggered when there are changes to a trip.

  - `newMessage`: Receive new messages from the chat.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

We use GitHub Projects to track our roadmap, backlog, and current progress.

[View the Roadmap Kanban Board](https://github.com/users/m0liveira/projects/1/views/1)

See the [open issues](https://github.com/m0liveira/strata-api/issues) for a full list of proposed features and known bugs.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Case Study -->

## Case Study

The Case studies for this project were made in Figma. You can explore the UI/UX decisions and the interactive mockups using the links below.

<div align="center">

[Design Case Study](https://www.figma.com/file/your-file-link)
[Software Case Study](https://www.figma.com/file/your-file-link)
[Interactive Prototype](https://www.figma.com/proto/your-prototype-link)

</div>

The design follows a mobile-first approach, focusing on making group itinerary planning and expense tracking as simple as possible.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are welcome. If you have an idea to improve this API, open an issue tagged as "enhancement" or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contributors

<a href="https://github.com/m0liveira/strata-api/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=m0liveira/strata-api" alt="Contributors" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Mateus Oliveira - moliveira.developer@gmail.com

Project Link: [https://github.com/m0liveira/strata-api](https://github.com/m0liveira/strata-api)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/m0liveira/strata-api.svg?style=for-the-badge
[contributors-url]: https://github.com/m0liveira/strata-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/m0liveira/strata-api.svg?style=for-the-badge
[forks-url]: https://github.com/m0liveira/strata-api/forks
[stars-shield]: https://img.shields.io/github/stars/m0liveira/strata-api.svg?style=for-the-badge
[stars-url]: https://github.com/m0liveira/strata-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/m0liveira/strata-api.svg?style=for-the-badge
[issues-url]: https://github.com/m0liveira/strata-api/issues
[license-shield]: https://img.shields.io/github/license/m0liveira/strata-api.svg?style=for-the-badge
[license-url]: https://github.com/m0liveira/strata-api/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/mateus-oliveira-271121194/
[product-cover]: ./strata-api/assets/images/cover.png
[product-cover2]: ./strata-api/assets/images/cover2.png
[NestJS]: https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white
[NestJS-url]: https://nestjs.com/
[Prisma]: https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white
[Prisma-url]: https://www.prisma.io/
[PostgreSQL]: https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[Supabase]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[TypeScript]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Swagger]: https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white
[Swagger-url]: https://swagger.io/
[Jest]: https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white
[Jest-url]: https://jestjs.io/
